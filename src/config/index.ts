import dotenv from 'dotenv';
import { validateEnv } from './validateEnv.js';

dotenv.config();

// 验证环境变量
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
 * 验证并获取配置
 */
function getConfig(): AppConfig {
  const port = parseInt(process.env.PORT || '3001', 10);
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your-secret-key') {
    if (nodeEnv === 'production') {
      throw new Error('JWT_SECRET 必须在生产环境中设置');
    }
  }

  return {
    port: isNaN(port) ? 3001 : port,
    nodeEnv,
    jwt: {
      secret: jwtSecret || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    upload: {
      dir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
    },
    cors: {
      origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    },
  };
}

export const config: AppConfig = getConfig();
