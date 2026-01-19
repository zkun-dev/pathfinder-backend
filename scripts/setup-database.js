import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('🚀 PathFinder 数据库设置向导\n');

  try {
    // 测试数据库连接
    console.log('📡 测试数据库连接...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');

    // 检查表是否存在
    console.log('🔍 检查数据库表...');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;

    const tableNames = tables.map(t => t.TABLE_NAME);
    const requiredTables = ['users', 'profiles', 'skills', 'projects', 'experiences', 'learnings', 'life'];

    const existingTables = requiredTables.filter(t => tableNames.includes(t));
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (existingTables.length > 0) {
      console.log(`✅ 已存在的表: ${existingTables.join(', ')}`);
    }

    if (missingTables.length > 0) {
      console.log(`⚠️  缺失的表: ${missingTables.join(', ')}`);
      console.log('\n💡 需要运行数据库迁移: npm run prisma:migrate');
    } else {
      console.log('✅ 所有表都已存在！');
    }

    // 检查是否有管理员用户
    console.log('\n👤 检查管理员用户...');
    const adminCount = await prisma.user.count();
    
    if (adminCount === 0) {
      console.log('⚠️  没有找到管理员用户');
      const createAdmin = await question('\n是否创建管理员用户？(y/n): ');
      
      if (createAdmin.toLowerCase() === 'y') {
        const username = await question('用户名 (默认: admin): ') || 'admin';
        const password = await question('密码 (默认: admin123): ') || 'admin123';
        const email = await question('邮箱 (默认: admin@example.com): ') || 'admin@example.com';

        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash(password, 10);

        await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
          },
        });

        console.log('\n✅ 管理员用户创建成功！');
        console.log(`   用户名: ${username}`);
        console.log(`   密码: ${password}`);
        console.log(`   邮箱: ${email}`);
      }
    } else {
      console.log(`✅ 找到 ${adminCount} 个用户`);
    }

    console.log('\n🎉 数据库设置完成！');
    console.log('\n📝 下一步：');
    console.log('   1. 启动后端服务: npm run dev');
    console.log('   2. 启动前端服务: cd ../PathFinder && pnpm dev');
    console.log('   3. 访问: http://localhost:3000');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 可能的原因：');
      console.log('   1. MySQL 服务未启动');
      console.log('   2. 数据库连接配置错误（检查 .env 文件）');
      console.log('   3. 数据库不存在（需要先创建数据库）');
    }
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

setupDatabase();
