import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaError } from '../types/index.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('服务器错误', err);

  // Zod 验证错误
  if (err instanceof z.ZodError || err.name === 'ZodError' || err.name === 'ValidationError') {
    const zodError = err as z.ZodError;
    return res.status(400).json({ 
      error: '数据验证失败',
      details: zodError.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 未授权错误
  if (err.name === 'UnauthorizedError' || err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '未授权访问，请先登录' });
  }

  // Prisma 错误处理
  const prismaError = err as PrismaError;
  if (prismaError.code === 'P2002') {
    const target = prismaError.meta?.target?.join(', ') || '字段';
    return res.status(400).json({ 
      error: `${target} 已存在，请检查输入`,
    });
  }

  if (prismaError.code === 'P2025') {
    return res.status(404).json({ error: '请求的资源不存在' });
  }

  if (prismaError.code === 'P2003') {
    return res.status(400).json({ error: '关联数据不存在' });
  }

  // Multer 文件上传错误
  if (err.message && (err.message.includes('文件') || err.message.includes('LIMIT') || err.message.includes('Multer'))) {
    if (err.message.includes('LIMIT_FILE_SIZE') || err.message.includes('File too large')) {
      return res.status(400).json({ error: '文件大小超过限制，请选择更小的文件' });
    }
    if (err.message.includes('不支持的文件类型') || err.message.includes('File type')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: '文件上传失败: ' + err.message });
  }

  // 默认服务器错误
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' 
      ? `服务器错误: ${err.message}` 
      : '服务器内部错误，请稍后重试',
  });
};
