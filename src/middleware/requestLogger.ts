import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * 请求日志中间件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip, headers, protocol, hostname } = req;

  // 记录请求开始（包括 origin 头，用于调试 CORS）
  // 使用 console.log 确保在生产环境也能看到日志
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl}`);
  console.log(`  Origin: ${headers.origin || 'none'}`);
  console.log(`  IP: ${ip}`);
  console.log(`  Protocol: ${protocol || 'unknown'}`);
  console.log(`  Hostname: ${hostname || 'unknown'}`);
  
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
