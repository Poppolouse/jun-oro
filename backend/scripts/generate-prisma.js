#!/usr/bin/env node

// Prisma Client'ı programmatic olarak generate et
// Binary execute izni gerektirmez

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🔄 Generating Prisma Client...');
  
  // Prisma CLI'yi node üzerinden çalıştır
  const prismaPath = join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');
  
  execSync(`node "${prismaPath}" generate`, {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('✅ Prisma Client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}
