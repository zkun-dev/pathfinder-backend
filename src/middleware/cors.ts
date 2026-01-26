import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * CORS 配置
 * 优化后的跨域处理逻辑
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // 允许无 origin 的请求（如 Postman、移动应用、服务器端请求等）
  if (!origin) {
    return next();
  }

  // 快速匹配：localhost（开发环境）
  if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return handlePreflight(req, res, next);
  }

  // 快速匹配：Railway 域名（生产环境）
  if (origin.includes('.up.railway.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return handlePreflight(req, res, next);
  }

  // 检查配置的允许源
  const allowedOrigins = Array.isArray(config.cors.origin) 
    ? config.cors.origin 
    : [config.cors.origin];

  // 规范化比较（移除尾部斜杠）
  const normalizedOrigin = origin.replace(/\/$/, '');
  const normalizedAllowedOrigins = allowedOrigins.map(o => {
    try {
      const url = new URL(o);
      return `${url.protocol}//${url.host}`;
    } catch {
      return o.replace(/\/$/, '');
    }
  });

  if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return handlePreflight(req, res, next);
  }

  // 如果 CORS_ORIGIN 设置为 '*'，允许所有来源
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return handlePreflight(req, res, next);
  }

  // 拒绝请求
  logger.warn(`CORS 请求被拒绝: ${origin}，允许的源: ${allowedOrigins.join(', ')}`);
  res.status(403).json({ error: '不允许的CORS源' });
};

/**
 * 处理预检请求（OPTIONS）
 */
function handlePreflight(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24小时
    return res.sendStatus(204);
  }
  next();
}
