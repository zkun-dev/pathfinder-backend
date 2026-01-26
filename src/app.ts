import express from 'express';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { corsMiddleware } from './middleware/cors.js';
import { securityHeaders } from './middleware/security.js';
import { performanceMonitorMiddleware } from './middleware/performance.js';

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
// 使用自定义 CORS 中间件，性能更好且逻辑更清晰
app.use(corsMiddleware);

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

// 启动日志（生产环境也显示，便于调试）
if (config.nodeEnv === 'production') {
  console.log(`\n[启动] 服务器启动中...`);
  console.log(`[启动] 端口: ${PORT} | 环境: ${config.nodeEnv}\n`);
}

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
