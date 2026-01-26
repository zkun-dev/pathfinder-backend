import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * 限流配置
 */
export const RATE_LIMIT_CONFIG = {
  API: { maxRequests: 100, windowMs: 60000 },      // API: 每分钟 100 次
  AUTH: { maxRequests: 5, windowMs: 60000 },      // 认证: 每分钟 5 次
  UPLOAD: { maxRequests: 10, windowMs: 60000 },   // 上传: 每分钟 10 次
} as const;

/**
 * 简单的内存限流器
 * 生产环境建议使用 redis-rate-limiter 或 express-rate-limit
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * 限流中间件
 * @param maxRequests 最大请求数
 * @param windowMs 时间窗口（毫秒）
 */
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const record = store[key];
    
    // 如果记录不存在或已过期，创建新记录
    if (!record || now > record.resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }
    
    // 增加计数
    record.count++;
    
    // 检查是否超过限制
    if (record.count > maxRequests) {
      logger.warn(`限流触发: IP ${key} 超过 ${maxRequests} 次请求`);
      return res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    next();
  };
};

/**
 * 清理过期的限流记录（定期执行）
 * 使用 WeakMap 或定期清理来防止内存泄漏
 */
const CLEANUP_INTERVAL = 60000; // 每分钟清理一次

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    delete store[key];
  });
  
  if (keysToDelete.length > 0) {
    logger.debug(`限流器清理: 删除了 ${keysToDelete.length} 条过期记录`);
  }
}, CLEANUP_INTERVAL);

// 优雅关闭时清理定时器
process.on('beforeExit', () => {
  clearInterval(cleanupInterval);
});
