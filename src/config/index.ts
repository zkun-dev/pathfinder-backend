import dotenv from 'dotenv';
import { validateEnv } from './validateEnv.js';

// 加载环境变量
dotenv.config();

// 验证环境变量（开发环境只警告，生产环境会抛出错误）
validateEnv();

/**
 * 应用配置接口
 */
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  jwt: {
    secret: string;
    expiresIn: string;
  };
  upload: {
    dir: string;
    maxFileSize: number;
  };
  cors: {
    origin: string[];
  };
}

/**
 * 获取应用配置
 * 
 * 注意：Railway 会自动设置 PORT 环境变量
 * 实际端口在 app.ts 中从 process.env.PORT 读取
 * 此处的 port 配置仅用于类型定义
 */
function getConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const port = parseInt(process.env.PORT || '3001', 10);
  
  // JWT 配置
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your-secret-key') {
    if (nodeEnv === 'production') {
      throw new Error('生产环境必须设置 JWT_SECRET');
    }
  }

  // 文件上传配置
  const uploadDir = process.env.UPLOAD_DIR || (nodeEnv === 'production' ? '/tmp/uploads' : './uploads');
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 默认 10MB

  // CORS 配置
  // 生产环境默认空数组，依赖 cors.ts 中的 Railway 域名自动匹配
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : nodeEnv === 'production' 
      ? []
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];

  return {
    port: isNaN(port) ? 3001 : port,
    nodeEnv,
    jwt: {
      secret: jwtSecret || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    upload: {
      dir: uploadDir,
      maxFileSize,
    },
    cors: {
      origin: corsOrigins,
    },
  };
}

// 导出配置实例
export const config: AppConfig = getConfig();
