import { z } from 'zod';

/**
 * 环境变量验证模式
 * 使用 Zod 进行类型安全的验证
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Railway 会自动设置 PORT，这里不验证
  PORT: z.string().optional(),
  DATABASE_URL: z.string().url('DATABASE_URL 必须是有效的 URL').optional(),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET 至少需要 10 个字符').optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'MAX_FILE_SIZE 必须是数字').default('10485760'), // 默认 10MB
  CORS_ORIGIN: z.string().optional(),
});

/**
 * 验证环境变量
 * - 开发环境：只警告，不中断启动
 * - 生产环境：验证失败时抛出错误
 */
export function validateEnv(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // 验证环境变量格式
  try {
    envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');

      if (isProduction) {
        throw new Error(`环境变量验证失败:\n${messages}`);
      } else {
        console.warn('⚠️  环境变量验证警告:\n', messages);
      }
    }
  }

  // 生产环境必须设置的关键变量
  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key') {
      throw new Error('生产环境必须设置 JWT_SECRET');
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('生产环境必须设置 DATABASE_URL');
    }
  }
}
