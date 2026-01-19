import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const email = process.argv[4] || 'admin@example.com';

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log(`用户 ${username} 已存在`);
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log('✅ 管理员用户创建成功！');
    console.log(`用户名: ${username}`);
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}`);
    console.log('\n⚠️  请妥善保管密码信息！');
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    if (error.code === 'P2002') {
      console.error('用户名或邮箱已存在');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
