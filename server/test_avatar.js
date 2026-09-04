import { dataStore } from './services/dataStore.js';

async function run() {
  const user = await dataStore.findUserByEmail('ravi@dsuniversity.ac.in');
  console.log('Test findUserByEmail:', {
    found: !!user,
    email: user?.email,
    id: user?.id,
    avatar_url: user?.avatar_url
  });
  process.exit(0);
}
run();
