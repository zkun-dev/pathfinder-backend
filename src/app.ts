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

const app: express.Application = express();

// 健康检查路由（最前面，不受任何中间件影响，确保 Railway 健康检查能通过）
app.get('/health', (_req, res) => {
  console.log(`[健康检查] ${new Date().toISOString()} - Health check requested`);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路径测试路由（用于验证服务是否正常运行）
app.get('/', (_req, res) => {
  console.log(`[根路径] ${new Date().toISOString()} - Root path accessed`);
  res.json({ 
    message: 'Pathfinder Backend API', 
    status: 'running',
    timestamp: new Date().toISOString() 
  });
});

// 请求日志（最早添加，记录所有请求）
app.use(requestLogger);

// CORS 配置（必须在其他中间件之前，特别是安全头之前）
// 这样可以确保预检请求（OPTIONS）能正确响应
app.use(cors({
  origin: (origin, callback) => {
    // 允许无origin的请求（如Postman、移动应用、服务器端请求等）
    if (!origin) {
      logger.info('CORS: 允许无origin请求');
      return callback(null, true);
    }
    
    logger.info(`CORS: 收到请求，origin: ${origin}`);
    
    // 允许所有 localhost 端口（开发和生产环境都允许，方便本地测试）
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      logger.info(`CORS: 匹配 localhost，允许: ${origin}`);
      return callback(null, true);
    }
    
    // 允许所有 Railway 域名（匹配所有 .up.railway.app 域名）
    // 使用 includes 检查，确保匹配所有 Railway 域名（包括带路径、端口等情况）
    if (origin.includes('.up.railway.app')) {
      logger.info(`CORS: 匹配 Railway 域名，允许: ${origin}`);
      return callback(null, true);
    }
    
    // 允许配置的源（规范化比较，支持带或不带尾部斜杠）
    const allowedOrigins = Array.isArray(config.cors.origin) 
      ? config.cors.origin 
      : [config.cors.origin];
    
    logger.info(`CORS: 配置的允许源: ${JSON.stringify(allowedOrigins)}`);
    
    // 规范化 origin（移除尾部斜杠和路径）用于比较
    // 只比较协议和域名部分
    try {
      const originUrl = new URL(origin);
      const normalizedOrigin = `${originUrl.protocol}//${originUrl.host}`;
      
      const normalizedAllowedOrigins = allowedOrigins.map(o => {
        try {
          const allowedUrl = new URL(o);
          return `${allowedUrl.protocol}//${allowedUrl.host}`;
        } catch {
          // 如果不是有效 URL，直接规范化
          return o.replace(/\/$/, '');
        }
      });
      
      // 允许配置的源（规范化后比较，只比较协议和域名）
      if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
        logger.info(`CORS: 匹配配置的源，允许: ${origin}`);
        return callback(null, true);
      }
    } catch (error) {
      // URL 解析失败，使用字符串比较
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedAllowedOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
      
      if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
        logger.info(`CORS: 匹配配置的源（字符串比较），允许: ${origin}`);
        return callback(null, true);
      }
    }
    
    // 如果都不匹配，记录警告并拒绝
    logger.warn(`CORS 请求被拒绝: ${origin}，允许的源: ${allowedOrigins.join(', ')}`);
    callback(new Error('不允许的CORS源'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24小时
  preflightContinue: false, // 立即响应预检请求，不继续传递
  optionsSuccessStatus: 204, // 预检请求成功状态码
}));

// 手动处理 OPTIONS 预检请求（确保所有预检请求都能正确响应）
app.options('*', (req, res) => {
  logger.info(`CORS: 处理 OPTIONS 预检请求: ${req.method} ${req.path}`);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// 性能监控
app.use(performanceMonitorMiddleware);

// 安全头（在 CORS 之后，避免干扰 CORS 预检请求）
app.use(securityHeaders);

// 请求体解析（跳过文件上传请求）
app.use((req, res, next) => {
  // 如果是文件上传请求，跳过 JSON 解析
  if (req.path.includes('/upload') && req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: config.upload.maxFileSize.toString() })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize.toString() }));

// 限流中间件（API 路由前）
app.use('/api', rateLimiter(100, 60000)); // 每分钟最多 100 次请求

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(config.upload.dir));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/learnings', learningRoutes);
app.use('/api/life', lifeRoutes);
app.use('/api/upload', uploadRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
// ⚠️ 重要：Railway 会自动设置 PORT 环境变量，必须使用它
// 不要使用 config.port，直接使用 process.env.PORT
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0'; // 监听所有网络接口，确保 Railway 可以访问

console.log(`\n[启动] 准备启动服务器...`);
console.log(`[启动] process.env.PORT: ${process.env.PORT || '未设置'}`);
console.log(`[启动] 使用端口: ${PORT}`);
console.log(`[启动] 监听地址: ${HOST}:${PORT}\n`);

// 添加错误处理，确保启动失败时能看到错误信息
try {
  const server = app.listen(PORT, HOST, () => {
    // 启动信息始终显示，无论环境如何
    console.log(`\n🚀 服务器启动成功！`);
    console.log(`📍 监听地址: ${HOST}:${PORT}`);
    console.log(`🌍 环境: ${config.nodeEnv}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`🔗 健康检查: http://${HOST}:${PORT}/health`);
    console.log(`📡 API 端点: http://${HOST}:${PORT}/api`);
    console.log(`\n`);
  });

  // 监听服务器错误
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`\n❌ 服务器启动失败！`);
    console.error(`错误信息: ${error.message}`);
    console.error(`错误代码: ${error.code}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`端口 ${PORT} 已被占用，请检查是否有其他进程在使用该端口`);
    }
    process.exit(1);
  });

  // 监听未捕获的异常
  process.on('uncaughtException', (error: Error) => {
    console.error(`\n❌ 未捕获的异常:`, error);
    process.exit(1);
  });

  // 监听未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error(`\n❌ 未处理的 Promise 拒绝:`, reason);
    process.exit(1);
  });
} catch (error) {
  console.error(`\n❌ 应用启动时发生错误:`, error);
  process.exit(1);
}

export default app;
