import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Studix Client for Vercel...');

// 1. If running inside client directory
if (fs.existsSync(path.resolve('vite.config.js'))) {
  execSync('npx vite build', { stdio: 'inherit' });
  process.exit(0);
}

// 2. If running from repository root
execSync('npm --prefix client run build', { stdio: 'inherit' });

const clientDist = path.resolve('client/dist');
const rootDist = path.resolve('dist');

if (fs.existsSync(clientDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('✅ Mirrored client/dist to root dist/ for automatic Vercel detection');
}
