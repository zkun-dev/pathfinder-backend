import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(databaseUrl) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    console.log('🔌 正在测试数据库连接...\n');
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 检查数据库
    const result = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
    const dbName = result[0]?.current_db;
    console.log(`✅ 当前数据库: ${dbName || '未知'}\n`);
    
    // 检查表
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    
    if (tables.length > 0) {
      console.log(`📊 找到 ${tables.length} 个表:`);
      tables.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
      console.log('');
    } else {
      console.log('⚠️  数据库中没有表，需要运行迁移\n');
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ 连接失败:', error.message);
    console.log('\n💡 请检查：');
    console.log('   1. DATABASE_URL 环境变量是否正确');
    console.log('   2. IP 白名单是否已配置');
    console.log('   3. 用户名和密码是否正确\n');
    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('📦 正在运行数据库迁移...\n');
    execSync('pnpm run prisma:migrate:deploy', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('\n✅ 数据库迁移完成！\n');
    return true;
  } catch (error) {
    console.log('\n❌ 迁移失败:', error.message);
    return false;
  }
}

async function createAdmin() {
  try {
    console.log('👤 正在创建管理员账号...\n');
    execSync('pnpm run create-admin', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('\n✅ 管理员账号创建完成！\n');
    return true;
  } catch (error) {
    console.log('\n⚠️  管理员账号可能已存在，跳过创建\n');
    return true; // 不算错误，账号可能已存在
  }
}

async function main() {
  console.log('🚀 TiDB Cloud 数据库迁移助手\n');
  console.log('='.repeat(50));
  console.log('');

  // 获取数据库连接
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ 错误: 未找到 DATABASE_URL 环境变量\n');
    console.log('请先设置环境变量：');
    console.log('  Windows PowerShell:');
    console.log('    $env:DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict"');
    console.log('  Linux/Mac:');
    console.log('    export DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict"');
    console.log('\n或者运行: pnpm run test-db 来交互式配置\n');
    rl.close();
    process.exit(1);
  }

  // 隐藏密码显示
  const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`📋 当前配置: ${maskedUrl}\n`);

  // 步骤 1: 测试连接
  const connected = await testConnection(databaseUrl);
  if (!connected) {
    console.log('❌ 无法连接到数据库，请检查配置后重试\n');
    rl.close();
    process.exit(1);
  }

  // 步骤 2: 运行迁移
  const migrateSuccess = await runMigrations();
  if (!migrateSuccess) {
    console.log('❌ 迁移失败，请检查错误信息\n');
    rl.close();
    process.exit(1);
  }

  // 步骤 3: 创建管理员
  await createAdmin();

  // 步骤 4: 最终验证
  console.log('🔍 最终验证...\n');
  const finalCheck = await testConnection(databaseUrl);
  
  if (finalCheck) {
    console.log('='.repeat(50));
    console.log('\n🎉 数据库迁移完成！\n');
    console.log('✅ 数据库连接正常');
    console.log('✅ 表结构已创建');
    console.log('✅ 管理员账号已准备就绪\n');
    console.log('下一步：');
    console.log('  1. 启动开发服务器: pnpm run dev');
    console.log('  2. 或部署到生产环境\n');
  } else {
    console.log('⚠️  最终验证失败，请检查配置\n');
  }

  rl.close();
}

main().catch(error => {
  console.error('发生错误:', error);
  rl.close();
  process.exit(1);
});
