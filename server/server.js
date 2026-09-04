import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { isSupabaseConfigured } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 STUDIX BACKEND ENGINE IS RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`🛡️  Database: ${isSupabaseConfigured ? 'Supabase PostgreSQL (Live)' : 'Integrated Academic Store (Active)'}`);
  console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection Details:', err);
});

export default server;
