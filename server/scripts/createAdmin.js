import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { dataStore } from '../services/dataStore.js';
import { isCollegeEmail } from '../utils/emailValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to promote an existing user or create a new administrator account.
 * Usage:
 *   node server/scripts/createAdmin.js <email> [password] [fullName]
 * Example:
 *   node server/scripts/createAdmin.js admin@dsuniversity.ac.in Admin@2026 "Chief Admin"
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage:
  node server/scripts/createAdmin.js <email> [password] [fullName]

Examples:
  1. Promote an existing registered user to ADMIN:
     node server/scripts/createAdmin.js admin@college.edu

  2. Create a brand new ADMIN account with password and profile:
     node server/scripts/createAdmin.js admin@college.edu SecurePass123! "Campus Admin"
`);
    process.exit(1);
  }

  const email = args[0].toLowerCase().trim();
  const password = args[1] || 'Studix@2026';
  const fullName = args[2] || 'System Administrator';

  console.log(`\n========================================`);
  console.log(`🎓 STUDIX ADMIN PROVISIONING UTILITY`);
  console.log(`========================================`);
  console.log(`Target Email: ${email}`);
  console.log(`Admin Name  : ${fullName}`);

  if (!isCollegeEmail(email)) {
    console.warn(
      `⚠️ Note: '${email}' is not a standard college domain, but admin provisioning will proceed.`
    );
  }

  try {
    let userId = null;

    // 1. Check or Create in Supabase Auth if configured
    if (isSupabaseConfigured && supabaseAdmin) {
      console.log(`📡 Connecting to Supabase Cloud Auth...`);

      // Try creating user in Supabase Auth
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: 'ADMIN' },
        });

      if (!authError && authData?.user) {
        userId = authData.user.id;
        console.log(`✅ Supabase Auth user created (ID: ${userId})`);
      } else if (authError) {
        // If user already exists in auth, find them
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuth = listData?.users?.find(
          (u) => u.email.toLowerCase() === email
        );
        if (existingAuth) {
          userId = existingAuth.id;
          console.log(`ℹ️ Existing Supabase Auth user found (ID: ${userId})`);
          // Update user password if supplied
          if (args[1]) {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              password,
              user_metadata: { role: 'ADMIN' },
            });
            console.log(`🔑 Password updated for Supabase Auth account.`);
          }
        } else {
          console.warn(`Supabase notice:`, authError.message);
        }
      }

      // 2. Fetch first available college for reference
      const { data: colleges } = await supabaseAdmin
        .from('colleges')
        .select('id')
        .limit(1);
      const defaultCollegeId = colleges?.[0]?.id || null;

      // 3. Upsert into Supabase `users` table with role = 'ADMIN'
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        const { error: updateErr } = await supabaseAdmin
          .from('users')
          .update({ role: 'ADMIN', full_name: fullName })
          .eq('email', email);

        if (updateErr) {
          console.error(`❌ Failed to update role in Supabase:`, updateErr.message);
        } else {
          console.log(`✅ Successfully updated '${email}' to role: 'ADMIN' in Supabase.`);
        }
      } else {
        const { error: insertErr } = await supabaseAdmin.from('users').insert([
          {
            id: userId || (await import('crypto')).randomUUID(),
            email,
            full_name: fullName,
            role: 'ADMIN',
            college_id: defaultCollegeId,
          },
        ]);

        if (insertErr) {
          console.error(`❌ Failed to insert into Supabase:`, insertErr.message);
        } else {
          console.log(`✅ Successfully inserted '${email}' with role: 'ADMIN' into Supabase.`);
        }
      }
    }

    // 4. Also update local MemoryStore / fallback cache
    let localUser = await dataStore.findUserByEmail(email);
    if (localUser) {
      await dataStore.updateUser(localUser.id, { role: 'ADMIN', fullName });
      console.log(`✅ Local data cache updated with ADMIN role.`);
    } else {
      const pwHash = await bcrypt.hash(password, 10);
      await dataStore.createUser({
        id: userId || `admin-${Date.now()}`,
        email,
        password,
        fullName,
        role: 'ADMIN',
      });
      console.log(`✅ Admin account registered in local data cache.`);
    }

    console.log(`\n🎉 SUCCESS: '${email}' is now an active ADMINISTRATOR!`);
    console.log(`You can now log in at http://localhost:5173/login with:`);
    console.log(`  Email   : ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`and access the Admin Panel at /admin.\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error provisioning admin:', err.message);
    process.exit(1);
  }
}

main();
