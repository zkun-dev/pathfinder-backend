import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 验证数据库迁移状态...\n');
    
    await prisma.$connect();
    console.log('✅ 数据库连接成功\n');
    
    // 检查表
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `;
    
    console.log(`📊 找到 ${tables.length} 个表:`);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    console.log('');
    
    // 检查用户
    const userCount = await prisma.user.count();
    console.log(`👤 用户数量: ${userCount}`);
    
    if (userCount > 0) {
      const admin = await prisma.user.findFirst({
        where: { username: 'admin' }
      });
      if (admin) {
        console.log('✅ 管理员账号已创建');
      }
    }
    
    console.log('\n🎉 数据库迁移验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
