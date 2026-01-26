import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

/**
 * 异步错误处理包装器
 * 自动捕获异步函数中的错误并传递给错误处理中间件
 */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      logger.error('异步处理错误', error instanceof Error ? error : new Error(String(error)));
      next(error);
    });
  };
}
