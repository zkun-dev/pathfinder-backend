# PathFinder 后端 API 服务

PathFinder 个人成长网站的后端 API 服务，基于 Node.js + Express + TypeScript + Prisma + MySQL。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 如果没有安装 pnpm，先安装
npm install -g pnpm

# 安装项目依赖
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

# （可选）打开 Prisma Studio 查看数据
pnpm run prisma:studio
```

### 4. 创建管理员用户

```bash
pnpm run create-admin
```

默认账号：`admin` / `admin123`

### 5. 启动服务

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm run build
pnpm start
```

服务将在 http://localhost:3001 启动。

## ✨ 核心特性

### 🔒 安全特性
- **JWT 认证** - 基于 Token 的身份验证
- **密码加密** - 使用 bcrypt 进行密码哈希
- **请求限流** - 防止 API 滥用（每分钟 100 次请求）
- **安全响应头** - 自动设置安全 HTTP 头
- **CORS 保护** - 可配置的跨域资源共享
- **输入验证** - 使用 Zod 进行数据验证
- **路径遍历防护** - 文件上传安全检查

### 📊 性能优化
- **请求日志** - 记录所有 API 请求和响应时间
- **性能监控** - 自动检测慢请求（>1秒）
- **分页支持** - 所有列表接口支持分页
- **查询优化** - 智能查询条件构建

### 🛠️ 开发体验
- **类型安全** - 完整的 TypeScript 类型定义
- **错误处理** - 统一的错误处理机制
- **环境变量验证** - 启动时验证必需的环境变量
- **日志系统** - 结构化日志记录（开发/生产环境）

### 📝 代码质量
- **异步错误处理** - 自动捕获异步错误
- **代码复用** - 通用工具函数库
- **统一响应格式** - 标准化的 API 响应结构

## 📁 项目结构

```
pathfinder-backend/
├── src/
│   ├── app.ts                 # Express 应用入口
│   ├── config/                # 配置文件
│   │   ├── index.ts          # 主配置
│   │   ├── database.ts       # 数据库配置
│   │   └── validateEnv.ts   # 环境变量验证
│   ├── controllers/          # 控制器（业务逻辑）
│   │   ├── authController.ts
│   │   ├── profileController.ts
│   │   ├── skillController.ts
│   │   ├── projectController.ts
│   │   ├── experienceController.ts
│   │   ├── learningController.ts
│   │   ├── lifeController.ts
│   │   └── uploadController.ts
│   ├── middleware/           # 中间件
│   │   ├── auth.ts           # JWT 认证中间件
│   │   ├── errorHandler.ts   # 错误处理中间件
│   │   ├── rateLimiter.ts    # 请求限流中间件
│   │   ├── requestLogger.ts  # 请求日志中间件
│   │   ├── security.ts       # 安全响应头中间件
│   │   └── performance.ts    # 性能监控中间件
│   ├── routes/               # 路由定义
│   │   ├── authRoutes.ts
│   │   ├── profileRoutes.ts
│   │   ├── skillRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── experienceRoutes.ts
│   │   ├── learningRoutes.ts
│   │   ├── lifeRoutes.ts
│   │   └── uploadRoutes.ts
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/                # 工具函数
│       ├── asyncHandler.ts   # 异步错误处理
│       ├── constants.ts      # 常量定义
│       ├── date.ts           # 日期处理工具
│       ├── jwt.ts            # JWT 工具
│       ├── logger.ts         # 日志工具（Winston）
│       ├── pagination.ts     # 分页工具
│       ├── performance.ts   # 性能监控工具
│       ├── query.ts          # 查询构建工具
│       ├── transform.ts      # 数据转换工具
│       ├── upload.ts         # 文件上传工具
│       └── validation.ts     # 数据验证工具
├── prisma/                   # 数据库模型
│   ├── schema.prisma         # Prisma 模型定义
│   └── migrations/          # 数据库迁移文件
├── scripts/                  # 工具脚本
│   ├── create-admin.js       # 创建管理员账号
│   ├── check-env.js          # 检查环境变量
│   ├── diagnose.js           # 数据库诊断
│   ├── setup-database.js     # 数据库设置
│   └── start-mysql.ps1      # 启动 MySQL（Windows）
├── uploads/                  # 上传文件目录
├── .env                      # 环境变量配置（需自行创建）
├── .env-template.txt         # 环境变量模板
├── .npmrc                    # pnpm 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

## 🔧 技术栈

### 核心框架
- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **TypeScript** - 类型安全

### 数据库
- **Prisma** - 现代化 ORM
- **MySQL** - 关系型数据库

### 安全与认证
- **JWT** - 身份认证
- **bcrypt** - 密码加密
- **helmet** - 安全响应头（通过 security 中间件）

### 工具库
- **Multer** - 文件上传
- **Zod** - 数据验证和类型安全
- **CORS** - 跨域支持
- **Winston** - 日志记录
- **dotenv** - 环境变量管理

### 开发工具
- **tsx** - TypeScript 执行器（开发模式）
- **pnpm** - 包管理器

## 📡 API 端点

### 认证相关

- `POST /api/auth/login` - 用户登录
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

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

- `GET /api/projects` - 获取项目列表
  - 查询参数：`page`, `limit`, `type`, `featured`
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

- `GET /api/life` - 获取生活动态列表
  - 查询参数：`page`, `limit`, `published`
- `GET /api/life/:id` - 获取生活动态详情
- `POST /api/life` - 创建生活动态（需认证）
- `PUT /api/life/:id` - 更新生活动态（需认证）
- `DELETE /api/life/:id` - 删除生活动态（需认证）

### 文件上传

- `POST /api/upload` - 上传文件（需认证）
  - Content-Type: `multipart/form-data`
  - 字段名：`file`
  - 支持类型：图片（jpeg, jpg, png, gif, webp）、文档（pdf, doc, docx）
  - 最大文件大小：5MB（可在 `.env` 中配置）

- `DELETE /api/upload/:id` - 删除文件（需认证）

### 健康检查

- `GET /health` - 服务健康检查
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

## 🔐 认证

API 使用 JWT（JSON Web Token）进行认证。

1. 通过 `/api/auth/login` 登录获取 token
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "username": "admin",
       "email": "admin@example.com"
     }
   }
   ```

2. 在后续请求的 Header 中携带 token：
   ```
   Authorization: Bearer <token>
   ```

3. Token 默认有效期为 7 天（可在 `.env` 中配置 `JWT_EXPIRES_IN`）

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

### 常见状态码

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `404` - 资源不存在
- `413` - 文件过大
- `429` - 请求过于频繁（限流）
- `500` - 服务器内部错误

## 📝 数据模型

### User（用户）
- id, username, email, password, createdAt, updatedAt

### Profile（个人信息）
- id, name, title, bio, avatarUrl, email, phone, location, socialLinks, createdAt, updatedAt

### Skill（技能）
- id, name, category, proficiency, icon, description, sortOrder, createdAt, updatedAt

### Project（项目）
- id, title, description, content, coverImage, techStack, type, links, featured, createdAt, updatedAt

### Experience（工作经历）
- id, companyName, companyLogo, position, description, content, startDate, endDate, techStack, achievements, sortOrder, createdAt, updatedAt

### Learning（学习记录）
- id, title, description, content, category, tags, resources, startDate, endDate, status, createdAt, updatedAt

### Life（生活动态）
- id, title, content, coverImage, tags, images, published, views, createdAt, updatedAt

详细的数据模型定义请查看 `prisma/schema.prisma`

## 🛠️ 开发命令

### 基础命令

```bash
# 开发模式（自动重启，热更新）
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产版本
pnpm start
```

### Prisma 命令

```bash
# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate

# 打开 Prisma Studio（数据库可视化工具）
pnpm run prisma:studio
```

### 工具脚本

```bash
# 创建管理员账号
pnpm run create-admin

# 检查环境变量配置
pnpm run check-env

# 数据库诊断
pnpm run diagnose

# 数据库初始化设置
pnpm run setup-db
```

## 📝 日志系统

项目使用 Winston 进行日志记录：

- **开发环境**：控制台彩色输出
- **生产环境**：文件日志
  - `combined.log` - 所有日志
  - `error.log` - 仅错误日志
  - `exceptions.log` - 未捕获的异常
  - `rejections.log` - Promise 拒绝

日志级别：`debug` < `info` < `warn` < `error`

## 🐛 故障排除

### 数据库连接问题

1. **检查 MySQL 服务是否运行**
   ```bash
   # Windows
   net start MySQL80
   
   # 或使用脚本
   .\scripts\start-mysql.ps1
   ```

2. **检查数据库配置**
   ```bash
   pnpm run check-env
   ```

3. **诊断数据库连接**
   ```bash
   pnpm run diagnose
   ```

4. **常见错误**
   - `P1001: Can't reach database server` - 检查 MySQL 服务是否启动
   - `P1000: Authentication failed` - 检查数据库用户名和密码
   - `P1003: Database does not exist` - 运行 `pnpm run setup-db` 创建数据库

### CORS 错误

- 确保 `.env` 中的 `CORS_ORIGIN` 配置正确
- 开发环境会自动允许所有 localhost 端口
- 生产环境需要明确配置允许的域名

### 端口冲突

- 默认端口：3001
- 可在 `.env` 中修改 `PORT` 配置
- 如果端口被占用，可以：
  ```bash
  # Windows - 查找占用端口的进程
  netstat -ano | findstr :3001
  
  # 终止进程（替换 PID）
  taskkill /PID <进程ID> /F
  ```

### 文件上传问题

- 检查 `uploads` 目录是否存在且有写权限
- 确认文件大小不超过 `MAX_FILE_SIZE`（默认 5MB）
- 确认文件类型在允许列表中

### 认证问题

- Token 过期：重新登录获取新 token
- Token 无效：检查 `JWT_SECRET` 配置是否正确
- 401 错误：确认请求头中包含 `Authorization: Bearer <token>`

### 性能问题

- 查看日志中的慢请求警告（>1秒）
- 检查数据库查询是否使用了索引
- 考虑添加缓存层（Redis）用于频繁查询的数据

## 📦 部署

### 🆓 免费部署方案（推荐）

我们提供了详细的 Railway 部署方案，适合个人项目和小型应用：

- **🚂 [Railway 部署指南](./RAILWAY_DEPLOY.md)** - 详细的图文教程，包含每一步的详细说明和故障排查（推荐）

**部署文档：** 查看 [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) 获取完整的 Railway 部署指南，包含：
- 10 个详细步骤的图文说明
- 环境变量配置指南
- 数据库初始化步骤
- 故障排查指南
- 后续维护说明

### Railway 部署步骤（快速参考）

1. **准备 GitHub 仓库**：确保代码已推送到 GitHub
2. **注册 Railway**：访问 [railway.app](https://railway.app/) 并使用 GitHub 登录
3. **创建项目**：选择 "Deploy from GitHub repo"，选择你的仓库
4. **添加数据库**：在项目中添加 MySQL 数据库服务
5. **配置环境变量**：设置所有必需的环境变量（见下方清单）
6. **配置构建命令**：`pnpm install && pnpm run prisma:generate && pnpm run build`
7. **配置启动命令**：`pnpm run deploy`
8. **初始化数据库**：在 Railway 终端运行 `pnpm run prisma:migrate:deploy`
9. **创建管理员**：运行 `pnpm run create-admin`
10. **测试部署**：访问 `/health` 端点验证服务运行

**详细步骤请查看 [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)**

### 本地生产环境配置

如果你想在本地服务器上部署：

1. **修改 `.env` 文件**：
   ```env
   NODE_ENV=production
   DATABASE_URL="mysql://user:password@host:3306/pathfinder?schema=public"
   JWT_SECRET=strong-secret-key-here-change-this
   JWT_EXPIRES_IN=7d
   PORT=3001
   CORS_ORIGIN=https://yourdomain.com
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   ```

2. **构建项目**：
   ```bash
   pnpm run build
   ```

3. **启动服务**：
   ```bash
   pnpm start
   ```

### 使用 PM2（推荐）

```bash
# 安装 PM2
pnpm add -g pm2
# 或
npm install -g pm2

# 启动应用
pm2 start dist/app.js --name pathfinder-api

# 设置开机自启
pm2 save
pm2 startup

# 查看状态
pm2 status

# 查看日志
pm2 logs pathfinder-api

# 重启应用
pm2 restart pathfinder-api

# 停止应用
pm2 stop pathfinder-api
```

### Docker 部署（可选）

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["pnpm", "start"]
```

### 生成 JWT Secret

部署前需要生成一个安全的 JWT Secret：

```bash
# 使用项目脚本生成
pnpm run generate-secret

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 环境变量检查清单

部署前确保以下环境变量已正确配置：

- ✅ `NODE_ENV` - 环境模式（production/development）
- ✅ `DATABASE_URL` - 数据库连接字符串
- ✅ `JWT_SECRET` - JWT 密钥（必须足够复杂，使用 `pnpm run generate-secret` 生成）
- ✅ `PORT` - 服务端口
- ✅ `CORS_ORIGIN` - 允许的前端域名
- ✅ `UPLOAD_DIR` - 文件上传目录路径
- ✅ `MAX_FILE_SIZE` - 最大文件大小（字节）

## 🔍 监控与维护

### 日志查看

```bash
# 查看所有日志
tail -f combined.log

# 查看错误日志
tail -f error.log

# 使用 PM2 查看日志
pm2 logs pathfinder-api
```

### 性能监控

- 应用会自动记录慢请求（>1秒）
- 查看日志中的性能警告
- 使用 PM2 监控内存和 CPU 使用情况

### 数据库备份

建议定期备份数据库：

```bash
# MySQL 备份
mysqldump -u user -p pathfinder > backup.sql

# 恢复
mysql -u user -p pathfinder < backup.sql
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范

1. **代码风格**
   - 使用 TypeScript 严格模式
   - 遵循 ESLint 规则
   - 使用 2 空格缩进

2. **提交信息**
   - 使用清晰的提交信息
   - 遵循 Conventional Commits 规范

3. **测试**
   - 确保代码通过编译
   - 测试 API 端点功能

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有开源项目的贡献者！

---

**PathFinder Backend** - 为前端提供强大的 API 支持 🚀

> 如有问题或建议，欢迎提交 Issue 或联系维护者。
