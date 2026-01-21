import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');
    
    // 检查数据库
    const result = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
    const dbName = result[0]?.current_db;
    console.log(`✅ 当前数据库: ${dbName || '未知'}`);
    
    // 检查表
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    
    if (tables.length > 0) {
      console.log(`✅ 找到 ${tables.length} 个表`);
      console.log(`   表名: ${tables.map(t => t.TABLE_NAME).join(', ')}`);
    } else {
      console.log('⚠️  数据库中没有表，需要运行迁移');
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ 连接失败:', error.message);
    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

async function main() {
  console.log('🔧 数据库连接配置助手\n');
  console.log('='.repeat(50));
  console.log('这个工具将帮助你配置正确的数据库连接信息\n');

  // 获取当前配置
  const currentUrl = process.env.DATABASE_URL || '';
  console.log(`当前配置: ${currentUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  // 询问用户信息
  const host = await question('MySQL 主机地址 (默认: localhost): ') || 'localhost';
  const port = await question('MySQL 端口 (默认: 3306): ') || '3306';
  const username = await question('MySQL 用户名 (默认: root): ') || 'root';
  const password = await question('MySQL 密码 (输入时不会显示): ');
  const database = await question('数据库名称 (默认: pathfinder): ') || 'pathfinder';

  // 构建连接字符串
  const databaseUrl = `mysql://${username}:${password}@${host}:${port}/${database}?schema=public`;

  console.log('\n正在测试连接...\n');
  
  const success = await testConnection(databaseUrl);

  if (success) {
    console.log('\n' + '='.repeat(50));
    const save = await question('\n是否保存到 .env 文件? (y/n): ');
    
    if (save.toLowerCase() === 'y' || save.toLowerCase() === 'yes') {
      // 读取 .env 文件
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      } else {
        // 如果不存在，从模板创建
        const templatePath = path.join(__dirname, '..', 'env-template.txt');
        if (fs.existsSync(templatePath)) {
          envContent = fs.readFileSync(templatePath, 'utf-8');
        }
      }

      // 更新或添加 DATABASE_URL
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(
          /DATABASE_URL=.*/,
          `DATABASE_URL="${databaseUrl}"`
        );
      } else {
        envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
      }

      // 保存文件
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ 配置已保存到 .env 文件！');
      console.log('\n下一步：');
      console.log('  1. 运行数据库迁移: pnpm run prisma:migrate');
      console.log('  2. 创建管理员用户: pnpm run create-admin');
      console.log('  3. 启动服务器: pnpm dev');
    } else {
      console.log('\n配置未保存。你可以手动编辑 .env 文件：');
      console.log(`DATABASE_URL="${databaseUrl}"`);
    }
  } else {
    console.log('\n' + '='.repeat(50));
    console.log('\n💡 可能的解决方案：');
    console.log('  1. 检查 MySQL 服务是否运行');
    console.log('  2. 确认用户名和密码是否正确');
    console.log('  3. 确认数据库是否存在（如果不存在，需要先创建）');
    console.log('  4. 检查防火墙设置');
    console.log('\n创建数据库命令：');
    console.log(`  mysql -u ${username} -p -e "CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`);
  }

  rl.close();
}

main().catch(error => {
  console.error('发生错误:', error);
  rl.close();
  process.exit(1);
});
