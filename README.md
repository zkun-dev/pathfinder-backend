# PathFinder 后端 API

PathFinder 个人成长网站的后端 API 服务，基于 Node.js + Express + TypeScript + Prisma + MySQL。

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `env-template.txt` 为 `.env` 并修改配置：

```env
DATABASE_URL="mysql://user:password@localhost:3306/pathfinder?schema=public"
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:3000
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate

# 创建管理员账号（默认：admin/admin123）
pnpm run create-admin
```

### 4. 启动服务

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm run build && pnpm start
```

服务将在 http://localhost:3001 启动。

## ✨ 核心特性

- **JWT 认证** - 基于 Token 的身份验证
- **密码加密** - 使用 bcrypt 进行密码哈希
- **请求限流** - 防止 API 滥用（每分钟 100 次请求）
- **安全响应头** - 自动设置安全 HTTP 头
- **输入验证** - 使用 Zod 进行数据验证
- **文件上传** - 支持图片和文档上传
- **请求日志** - 记录所有 API 请求和响应时间
- **性能监控** - 自动检测慢请求（>1秒）
- **分页支持** - 所有列表接口支持分页

## 📁 项目结构

```
pathfinder-backend/
├── src/                          # 源代码目录
│   ├── app.ts                    # Express 应用入口，配置中间件和路由
│   ├── config/                   # 配置文件
│   │   ├── index.ts              # 主配置文件，导出所有配置
│   │   ├── database.ts           # 数据库连接配置
│   │   └── validateEnv.ts        # 环境变量验证
│   ├── controllers/              # 控制器（业务逻辑层）
│   │   ├── authController.ts     # 认证控制器（登录、获取用户信息）
│   │   ├── profileController.ts  # 个人信息控制器
│   │   ├── skillController.ts   # 技能管理控制器
│   │   ├── projectController.ts  # 项目管理控制器
│   │   ├── experienceController.ts # 工作经历控制器
│   │   ├── learningController.ts # 学习记录控制器
│   │   ├── lifeController.ts     # 生活动态控制器
│   │   └── uploadController.ts   # 文件上传控制器
│   ├── middleware/               # 中间件
│   │   ├── auth.ts               # JWT 认证中间件
│   │   ├── errorHandler.ts       # 全局错误处理中间件
│   │   ├── rateLimiter.ts        # 请求限流中间件
│   │   ├── requestLogger.ts      # 请求日志中间件
│   │   ├── security.ts           # 安全响应头中间件
│   │   └── performance.ts        # 性能监控中间件
│   ├── routes/                   # 路由定义
│   │   ├── authRoutes.ts         # 认证路由
│   │   ├── profileRoutes.ts      # 个人信息路由
│   │   ├── skillRoutes.ts        # 技能管理路由
│   │   ├── projectRoutes.ts      # 项目管理路由
│   │   ├── experienceRoutes.ts   # 工作经历路由
│   │   ├── learningRoutes.ts     # 学习记录路由
│   │   ├── lifeRoutes.ts         # 生活动态路由
│   │   └── uploadRoutes.ts       # 文件上传路由
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts              # 全局类型定义
│   └── utils/                    # 工具函数
│       ├── asyncHandler.ts       # 异步错误处理包装器
│       ├── constants.ts          # 常量定义
│       ├── date.ts               # 日期处理工具
│       ├── jwt.ts                # JWT 工具函数（生成、验证 token）
│       ├── logger.ts             # Winston 日志配置
│       ├── pagination.ts         # 分页工具函数
│       ├── performance.ts        # 性能监控工具
│       ├── query.ts              # 查询构建工具
│       ├── transform.ts          # 数据转换工具
│       ├── upload.ts             # 文件上传工具（Multer 配置）
│       └── validation.ts         # Zod 验证工具
├── prisma/                       # Prisma 数据库相关
│   ├── schema.prisma             # Prisma 数据模型定义
│   └── migrations/               # 数据库迁移文件
├── scripts/                      # 工具脚本
│   ├── create-admin.js           # 创建管理员账号脚本
│   ├── check-env.js              # 检查环境变量脚本
│   ├── diagnose.js               # 数据库诊断脚本
│   ├── generate-secret.js        # 生成 JWT Secret 脚本
│   ├── setup-database.js         # 数据库初始化脚本
│   ├── start-mysql.ps1           # 启动 MySQL 服务（Windows）
│   └── test-db-connection.js    # 测试数据库连接脚本
├── uploads/                      # 文件上传目录（自动创建）
├── .env                          # 环境变量配置（需自行创建）
├── .env-template.txt             # 环境变量模板
├── .npmrc                        # pnpm 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖和脚本
└── README.md                     # 项目说明文档
```

## 📡 API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需认证）

### 个人信息
- `GET /api/profile` - 获取个人信息（公开）
- `PUT /api/profile` - 更新个人信息（需认证）

### 技能管理
- `GET /api/skills` - 获取技能列表
- `POST /api/skills` - 创建技能（需认证）
- `PUT /api/skills/:id` - 更新技能（需认证）
- `DELETE /api/skills/:id` - 删除技能（需认证）

### 项目管理
- `GET /api/projects` - 获取项目列表（支持分页、筛选）
- `GET /api/projects/:id` - 获取项目详情
- `POST /api/projects` - 创建项目（需认证）
- `PUT /api/projects/:id` - 更新项目（需认证）
- `DELETE /api/projects/:id` - 删除项目（需认证）

### 工作经历
- `GET /api/experiences` - 获取工作经历列表
- `GET /api/experiences/:id` - 获取工作经历详情
- `POST /api/experiences` - 创建工作经历（需认证）
- `PUT /api/experiences/:id` - 更新工作经历（需认证）
- `DELETE /api/experiences/:id` - 删除工作经历（需认证）

### 学习记录
- `GET /api/learnings` - 获取学习记录列表
- `GET /api/learnings/:id` - 获取学习记录详情
- `POST /api/learnings` - 创建学习记录（需认证）
- `PUT /api/learnings/:id` - 更新学习记录（需认证）
- `DELETE /api/learnings/:id` - 删除学习记录（需认证）

### 生活动态
- `GET /api/life` - 获取生活动态列表（支持分页）
- `GET /api/life/:id` - 获取生活动态详情
- `POST /api/life` - 创建生活动态（需认证）
- `PUT /api/life/:id` - 更新生活动态（需认证）
- `DELETE /api/life/:id` - 删除生活动态（需认证）

### 文件上传
- `POST /api/upload` - 上传文件（需认证）
- `DELETE /api/upload/:id` - 删除文件（需认证）

### 健康检查
- `GET /health` - 服务健康检查

## 🔐 认证

API 使用 JWT 进行认证：

1. 通过 `/api/auth/login` 登录获取 token
2. 在后续请求的 Header 中携带：`Authorization: Bearer <token>`
3. Token 默认有效期为 7 天（可在 `.env` 中配置）

## 📋 API 响应格式

### 成功响应

```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "error": "错误消息",
  "details": [
    {
      "path": "fieldName",
      "message": "具体错误信息"
    }
  ]
}
```

## 🔧 技术栈

- **Node.js** + **Express** + **TypeScript**
- **Prisma** + **MySQL**
- **JWT** + **bcrypt**
- **Zod**（数据验证）
- **Multer**（文件上传）
- **Winston**（日志记录）

## 🛠️ 开发命令

```bash
# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产版本
pnpm start

# Prisma 相关
pnpm run prisma:generate      # 生成 Prisma 客户端
pnpm run prisma:migrate       # 运行数据库迁移
pnpm run prisma:studio        # 打开 Prisma Studio

# 工具脚本
pnpm run create-admin         # 创建管理员账号
pnpm run check-env            # 检查环境变量配置
pnpm run diagnose             # 数据库诊断
```

## 📦 部署

### 环境变量清单

部署前确保配置以下环境变量：

- `NODE_ENV` - 环境模式（production/development）
- `DATABASE_URL` - 数据库连接字符串
- `JWT_SECRET` - JWT 密钥（使用 `pnpm run generate-secret` 生成）
- `PORT` - 服务端口
- `CORS_ORIGIN` - 允许的前端域名
- `UPLOAD_DIR` - 文件上传目录路径
- `MAX_FILE_SIZE` - 最大文件大小（字节）

### 部署步骤

1. **构建项目**
   ```bash
   pnpm run build
   ```

2. **运行数据库迁移**
   ```bash
   pnpm run prisma:migrate:deploy
   ```

3. **启动服务**
   ```bash
   pnpm start
   ```

### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/app.js --name pathfinder-api

# 设置开机自启
pm2 save
pm2 startup
```

## 🐛 常见问题

### 数据库连接失败

- 检查 MySQL 服务是否运行
- 验证 `DATABASE_URL` 配置是否正确
- 运行 `pnpm run diagnose` 进行诊断

### 端口被占用

```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :3001

# 终止进程
taskkill /PID <进程ID> /F
```

### Token 认证失败

- 检查 `JWT_SECRET` 配置是否正确
- 确认请求头格式：`Authorization: Bearer <token>`
- Token 可能已过期，重新登录获取新 token

## 📄 许可证

MIT License

---

**PathFinder Backend** - 为前端提供强大的 API 支持 🚀
