import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

console.log('🔍 检查环境配置...\n');

// 检查 .env 文件是否存在
if (!fs.existsSync(envPath)) {
  console.log('❌ .env 文件不存在');
  console.log('💡 请复制 env-template.txt 为 .env 并配置数据库连接');
  process.exit(1);
}

console.log('✅ .env 文件存在');

// 读取 .env 文件
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

// 检查关键配置
let hasDatabaseUrl = false;
let hasJwtSecret = false;
let databaseUrl = '';

for (const line of lines) {
  if (line.startsWith('DATABASE_URL=')) {
    hasDatabaseUrl = true;
    databaseUrl = line.split('=')[1]?.replace(/"/g, '') || '';
  }
  if (line.startsWith('JWT_SECRET=') && !line.includes('your-secret-key')) {
    hasJwtSecret = true;
  }
}

console.log('\n📋 配置检查：');
console.log(`  数据库连接: ${hasDatabaseUrl ? '✅' : '❌'}`);

if (hasDatabaseUrl) {
  // 检查是否是默认配置
  if (databaseUrl.includes('password') || databaseUrl.includes('root@localhost')) {
    console.log('   ⚠️  数据库连接似乎是默认配置，请修改为你的实际配置');
  } else {
    console.log(`   ✅ 数据库URL: ${databaseUrl.substring(0, 30)}...`);
  }
}

console.log(`  JWT密钥: ${hasJwtSecret ? '✅' : '⚠️  使用默认值'}`);

console.log('\n📝 下一步：');
if (!hasDatabaseUrl || databaseUrl.includes('password')) {
  console.log('   1. 编辑 .env 文件，配置 DATABASE_URL');
  console.log('   2. 在 MySQL 中创建数据库: CREATE DATABASE pathfinder;');
  console.log('   3. 运行: npm run prisma:migrate');
} else {
  console.log('   ✅ 环境配置看起来正常');
  console.log('   💡 可以尝试运行: npm run prisma:migrate');
}
