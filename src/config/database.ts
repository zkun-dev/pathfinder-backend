import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : [{ level: 'error', emit: 'stdout' }],
});

// 开发环境下记录查询日志
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; params: string; duration: number }) => {
    logger.debug('Prisma Query', { query: e.query, duration: `${e.duration}ms` });
  });
}

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('数据库连接已关闭');
});

export default prisma;
