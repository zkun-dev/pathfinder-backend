import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ error: '认证令牌格式错误' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
    
    if (!decoded.userId || typeof decoded.userId !== 'number') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: '认证令牌已过期，请重新登录' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: '无效的认证令牌' });
      }
      logger.error('认证失败', error);
    }
    return res.status(401).json({ error: '认证失败，请重新登录' });
  }
};
