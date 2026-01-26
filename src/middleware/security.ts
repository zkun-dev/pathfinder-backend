import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

/**
 * 安全响应头中间件
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 防止 XSS 攻击
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 生产环境添加更严格的安全头
  if (config.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // 注意：不设置 Content-Security-Policy，因为它会阻止跨域请求
    // 如果需要 CSP，应该设置为允许跨域：default-src 'self' *.up.railway.app;
  }
  
  next();
};
