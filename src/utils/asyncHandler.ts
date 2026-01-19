import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

/**
 * 异步错误处理包装器
 * 自动捕获异步函数中的错误并传递给错误处理中间件
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('异步处理错误', error);
      next(error);
    });
  };
}
