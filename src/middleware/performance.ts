import { Request, Response, NextFunction } from 'express';
import { performanceMonitor } from '../utils/performance.js';
import { logger } from '../utils/logger.js';

/**
 * 性能监控中间件
 */
export const performanceMonitorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const metricName = `${req.method}_${req.path}`;
  performanceMonitor.start(metricName);

  res.on('finish', () => {
    const duration = performanceMonitor.end(metricName);
    if (duration && duration > 1000) {
      logger.warn(`慢请求检测: ${req.method} ${req.path} 耗时 ${duration}ms`);
    }
  });

  next();
};
