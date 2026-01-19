import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { securityHeaders } from './middleware/security.js';
import { performanceMonitorMiddleware } from './middleware/performance.js';
import { logger } from './utils/logger.js';

// 路由
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import lifeRoutes from './routes/lifeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

// 请求日志（最早添加，记录所有请求）
app.use(requestLogger);

// 性能监控
app.use(performanceMonitorMiddleware);

// 安全头
app.use(securityHeaders);

// 中间件
app.use(cors({
  origin: (origin, callback) => {
    // 允许无origin的请求（如Postman、移动应用等）
    if (!origin) return callback(null, true);
    
    const allowedOrigins = Array.isArray(config.cors.origin) 
      ? config.cors.origin 
      : [config.cors.origin];
    
    // 开发环境允许所有localhost端口
    if (config.nodeEnv === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流中间件（API 路由前）
app.use('/api', rateLimiter(100, 60000)); // 每分钟最多 100 次请求

// 静态文件服务（上传的文件）
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/learnings', learningRoutes);
app.use('/api/life', lifeRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 服务器运行在 http://localhost:${PORT}`);
  logger.info(`环境: ${config.nodeEnv}`);
});

export default app;
