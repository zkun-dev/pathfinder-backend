import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip, headers } = req;

  // 记录请求开始（包括 origin 头，用于调试 CORS）
  console.log(`[请求] ${method} ${originalUrl} - Origin: ${headers.origin || 'none'} - IP: ${ip}`);
  logger.info(`${method} ${originalUrl}`, { ip, origin: headers.origin });

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    if (statusCode >= 400) {
      logger.warn(`${method} ${originalUrl} ${statusCode}`, { 
        ip, 
        duration: `${duration}ms`,
        statusCode 
      });
    } else {
      logger.info(`${method} ${originalUrl} ${statusCode}`, { 
        ip, 
        duration: `${duration}ms` 
      });
    }
  });

  next();
};
