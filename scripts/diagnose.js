import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

console.log('🔍 PathFinder 数据库诊断工具\n');
console.log('='.repeat(50));

// 检查 .env 文件
console.log('\n1️⃣ 检查环境变量文件...');
try {
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.default.existsSync(envPath)) {
    console.log('✅ .env 文件存在');
    const envContent = fs.default.readFileSync(envPath, 'utf-8');
    const dbUrl = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
    
    if (dbUrl) {
      const url = dbUrl.split('=')[1]?.replace(/"/g, '') || '';
      if (url.includes('password') || url.includes('root@localhost')) {
        console.log('⚠️  数据库URL似乎是默认配置');
        console.log(`   当前: ${url.substring(0, 50)}...`);
        console.log('   请编辑 .env 文件修改 DATABASE_URL');
      } else {
        console.log('✅ 数据库URL已配置');
        // 解析数据库信息
        try {
          const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
          if (match) {
            console.log(`   用户: ${match[1]}`);
            console.log(`   主机: ${match[3]}:${match[4]}`);
            console.log(`   数据库: ${match[5]}`);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    } else {
      console.log('❌ 未找到 DATABASE_URL 配置');
    }
  } else {
    console.log('❌ .env 文件不存在');
    console.log('   请复制 env-template.txt 为 .env');
  }
} catch (error) {
  console.log('⚠️  无法检查 .env 文件:', error.message);
}

// 检查 MySQL 服务
console.log('\n2️⃣ 检查 MySQL 服务...');
try {
  // Windows 检查 MySQL 服务
  if (process.platform === 'win32') {
    try {
      const result = execSync('sc query MySQL80', { encoding: 'utf-8', stdio: 'pipe' });
      if (result.includes('RUNNING')) {
        console.log('✅ MySQL 服务正在运行 (MySQL80)');
      } else if (result.includes('STOPPED')) {
        console.log('⚠️  MySQL 服务已停止 (MySQL80)');
        console.log('   请启动 MySQL 服务');
      } else {
        console.log('⚠️  无法确定 MySQL80 服务状态');
      }
    } catch (e) {
      // 尝试其他常见的 MySQL 服务名
      try {
        const result = execSync('sc query MySQL', { encoding: 'utf-8', stdio: 'pipe' });
        if (result.includes('RUNNING')) {
          console.log('✅ MySQL 服务正在运行 (MySQL)');
        } else {
          console.log('⚠️  MySQL 服务未运行或未找到');
        }
      } catch (e2) {
        console.log('⚠️  无法检查 MySQL 服务状态');
        console.log('   请手动检查 MySQL 服务是否运行');
      }
    }
  } else {
    // Linux/Mac 检查
    try {
      execSync('systemctl is-active mysql', { encoding: 'utf-8', stdio: 'pipe' });
      console.log('✅ MySQL 服务正在运行');
    } catch (e) {
      try {
        execSync('systemctl is-active mysqld', { encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ MySQL 服务正在运行 (mysqld)');
      } catch (e2) {
        console.log('⚠️  无法确定 MySQL 服务状态');
        console.log('   请手动检查: systemctl status mysql 或 systemctl status mysqld');
      }
    }
  }
} catch (error) {
  console.log('⚠️  无法检查 MySQL 服务:', error.message);
}

// 测试数据库连接
console.log('\n3️⃣ 测试数据库连接...');
const prisma = new PrismaClient();

try {
  await prisma.$connect();
  console.log('✅ 数据库连接成功！');
  
  // 检查数据库是否存在
  const result = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
  console.log(`✅ 当前数据库: ${result[0]?.current_db || '未知'}`);
  
  // 检查表
  const tables = await prisma.$queryRaw`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE()
  `;
  
  if (tables.length > 0) {
    console.log(`✅ 找到 ${tables.length} 个表`);
  } else {
    console.log('⚠️  数据库中没有表，需要运行迁移');
  }
  
  await prisma.$disconnect();
} catch (error) {
  console.log('❌ 数据库连接失败');
  console.log(`   错误: ${error.message}`);
  
  if (error.code === 'P1001') {
    console.log('\n💡 可能的原因：');
    console.log('   1. MySQL 服务未启动');
    console.log('   2. 数据库连接配置错误（检查 .env 文件）');
    console.log('   3. 数据库不存在（需要先创建）');
    console.log('   4. 防火墙阻止了连接');
  } else if (error.code === 'P1000') {
    console.log('\n💡 认证失败，请检查：');
    console.log('   1. 用户名和密码是否正确');
    console.log('   2. 用户是否有访问权限');
  }
  
  await prisma.$disconnect().catch(() => {});
}

console.log('\n' + '='.repeat(50));
console.log('\n📝 下一步操作建议：\n');

console.log('如果 MySQL 服务未运行：');
console.log('  Windows: 在服务管理器中启动 MySQL 服务');
console.log('  Linux: sudo systemctl start mysql');

console.log('\n如果数据库不存在：');
console.log('  在 MySQL 中执行: CREATE DATABASE pathfinder;');

console.log('\n如果配置需要修改：');
console.log('  编辑 pathfinder-backend/.env 文件');

console.log('\n配置完成后，运行：');
console.log('  npm run prisma:migrate');
