import express from 'express';
import { config } from './config/index.js';

// 中间件
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

// ============================================
// 基础路由（不受中间件影响）
// ============================================
// 健康检查路由 - Railway 健康检查使用
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路径 - 服务状态查询
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Pathfinder Backend API', 
    status: 'running',
    timestamp: new Date().toISOString() 
  });
});

// ============================================
// 全局中间件（按顺序执行）
// ============================================
// 0. 最基础的请求拦截器（用于调试）- 在所有路由和中间件之前
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[RAW] ${timestamp} ${req.method} ${req.url}`);
  console.log(`[RAW] Origin: ${req.headers.origin || 'none'}`);
  console.log(`[RAW] Host: ${req.headers.host || 'none'}`);
  console.log(`[RAW] User-Agent: ${req.headers['user-agent']?.substring(0, 60) || 'none'}...`);
  next();
});

// 1. 请求日志 - 记录所有请求
app.use(requestLogger);

// 2. CORS 配置 - 必须在其他中间件之前
app.use(corsMiddleware);

// 3. 性能监控 - 检测慢请求
app.use(performanceMonitorMiddleware);

// 4. 安全响应头 - 在 CORS 之后，避免干扰预检请求
app.use(securityHeaders);

// 5. 请求体解析 - 跳过文件上传请求
app.use((req, res, next) => {
  if (req.path.includes('/upload') && req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: config.upload.maxFileSize.toString() })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize.toString() }));

// 6. 请求限流 - API 路由前，防止滥用
app.use('/api', rateLimiter(100, 60000)); // 每分钟最多 100 次请求

// ============================================
// 静态文件服务
// ============================================
app.use('/uploads', express.static(config.upload.dir));

// ============================================
// API 路由
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/learnings', learningRoutes);
app.use('/api/life', lifeRoutes);
app.use('/api/upload', uploadRoutes);

// ============================================
// 错误处理（必须在最后）
// ============================================
app.use(errorHandler);

// ============================================
// 服务器启动
// ============================================
// Railway 会自动设置 PORT 环境变量
const PORT = parseInt(process.env.PORT || '3001', 10);
// 监听地址：服务器绑定的网络接口（内部地址）
// - 开发环境：localhost（只在本机可访问，便于调试）
// - 生产环境：0.0.0.0（允许所有网络接口，Railway/云平台路由层需要）
// 使用环境变量 HOST 可以覆盖，默认根据 NODE_ENV 自动设置
const HOST = process.env.HOST || (config.nodeEnv === 'development' ? 'localhost' : '0.0.0.0');

// 启动服务器
try {
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n🚀 服务器启动成功！`);
    // 如果绑定到 0.0.0.0，则在日志中显示 localhost 以便开发者直接在浏览器中访问
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`📍 访问地址: http://${displayHost}:${PORT}`);
    console.log(`🌍 环境: ${config.nodeEnv}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  });

  // 服务器错误处理
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`\n❌ 服务器启动失败！`);
    console.error(`错误信息: ${error.message}`);
    console.error(`错误代码: ${error.code}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`端口 ${PORT} 已被占用，请检查是否有其他进程在使用该端口`);
    }
    process.exit(1);
  });

  // 未捕获的异常处理
  process.on('uncaughtException', (error: Error) => {
    console.error(`\n❌ 未捕获的异常:`, error);
    process.exit(1);
  });

  // 未处理的 Promise 拒绝处理
  process.on('unhandledRejection', (reason: unknown) => {
    console.error(`\n❌ 未处理的 Promise 拒绝:`, reason);
    process.exit(1);
  });
} catch (error) {
  console.error(`\n❌ 应用启动时发生错误:`, error);
  process.exit(1);
}

export default app;
