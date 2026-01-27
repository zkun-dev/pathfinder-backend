# PathFinder Backend 部署指南

本文档提供 PathFinder 后端 API 和数据库的完整部署指南，包括 Railway 云部署和本地部署两种方式。

## 📋 目录

- [前置要求](#前置要求)
- [Railway 云部署（推荐）](#railway-云部署推荐)
- [本地部署](#本地部署)
- [数据库配置](#数据库配置)
- [环境变量配置](#环境变量配置)
- [部署后验证](#部署后验证)
- [常见问题排查](#常见问题排查)

---

## 前置要求

### 必需工具

- **Node.js** 18+ 
- **pnpm** 包管理器
- **MySQL** 数据库（本地部署需要）
- **Git**（用于版本控制）

### 可选工具

- **Docker**（用于容器化部署）
- **Railway 账号**（用于云部署）

---

## Railway 云部署（推荐）

Railway 是一个现代化的云平台，支持自动部署、数据库管理和环境变量配置。

### 步骤 1: 准备 GitHub 仓库

1. 确保代码已推送到 GitHub 仓库
2. 确认仓库包含以下文件：
   - `Dockerfile`
   - `package.json`
   - `prisma/schema.prisma`
   - `src/` 目录

### 步骤 2: 创建 Railway 项目

1. 访问 [Railway](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 **"New Project"** 创建新项目
4. 选择 **"Deploy from GitHub repo"**
5. 选择你的 `pathfinder-backend` 仓库

### 步骤 3: 添加 MySQL 数据库

1. 在 Railway 项目中，点击 **"New"** → **"Database"** → **"Add MySQL"**
2. 等待数据库创建完成（通常需要 1-2 分钟）
3. 记录数据库服务名称（例如：`MySQL`）

### 步骤 4: 配置环境变量

1. 点击后端服务（不是数据库服务）
2. 进入 **"Variables"** 标签页
3. 添加以下环境变量：

#### 必需环境变量

```bash
# 数据库连接（使用 Railway 变量引用）
DATABASE_URL=${{MySQL.MYSQL_URL}}

# JWT 密钥（必须设置强密钥，至少 32 字符）
# 作用：用于签名和验证用户登录 Token，确保 API 安全性
# 获取方法：运行 pnpm run generate-secret 生成随机密钥
JWT_SECRET=your-strong-secret-key-at-least-32-characters-long

# 环境模式
NODE_ENV=production

# 文件上传目录（Railway 推荐使用 /tmp）
UPLOAD_DIR=/tmp/uploads

# 最大文件大小（字节，默认 10MB）
MAX_FILE_SIZE=10485760
```

#### 可选环境变量

```bash
# CORS 配置（多个源用逗号分隔）
CORS_ORIGIN=https://your-frontend-domain.com

# JWT 过期时间（默认 7 天）
JWT_EXPIRES_IN=7d

# 管理员账号配置（首次部署时自动创建）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_EMAIL=admin@example.com

# 跳过自动创建管理员（如果已存在）
ADMIN_SKIP_CREATE=false
```
### 步骤 5: 部署配置

1. Railway 会自动检测 `Dockerfile` 并开始构建
2. 构建过程包括：
   - 安装依赖
   - 生成 Prisma Client
   - 编译 TypeScript
   - 运行数据库迁移
   - 创建管理员账号
   - 启动服务器

### 步骤 6: 获取服务地址

1. 部署完成后，Railway 会自动分配一个域名
2. 格式：`https://your-service-name.up.railway.app`
3. 在服务设置中可以配置自定义域名

### 步骤 7: 验证部署

访问以下端点验证部署：

```bash
# 健康检查
curl https://your-service-name.up.railway.app/health

# 根路径
curl https://your-service-name.up.railway.app/

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 本地部署

### 步骤 1: 克隆仓库

```bash
git clone <your-repository-url>
cd pathfinder-backend
```

### 步骤 2: 安装依赖

```bash
pnpm install
```

### 步骤 3: 配置环境变量

1. 复制环境变量模板：

```bash
cp env-template.txt .env
```

2. 编辑 `.env` 文件，配置以下变量：

```bash
# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/pathfinder?schema=public"

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3001
NODE_ENV=development

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

### 步骤 4: 设置 MySQL 数据库

#### 安装 MySQL

**macOS (使用 Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

#### 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE pathfinder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出
EXIT;
```

### 步骤 5: 运行数据库迁移

```bash
# 生成 Prisma Client
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate
```

### 步骤 6: 创建管理员账号

```bash
pnpm run create-admin
```

默认管理员账号：
- 用户名：`admin`
- 密码：`admin123`
- 邮箱：`admin@example.com`

可以通过环境变量或命令行参数自定义：

```bash
# 使用环境变量
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=mypassword pnpm run create-admin

# 或使用命令行参数
node scripts/create-admin.js myadmin mypassword admin@example.com
```

### 步骤 7: 启动服务

#### 开发模式

```bash
pnpm run dev
```

服务将在 `http://localhost:3001` 启动，支持热重载。

#### 生产模式

```bash
# 构建项目
pnpm run build

# 启动服务
pnpm start
```

### 步骤 8: 验证部署

```bash
# 健康检查
curl http://localhost:3001/health

# 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 数据库配置

### Prisma Schema

数据库结构定义在 `prisma/schema.prisma` 文件中。主要包含以下模型：

- **User** - 用户表
- **Profile** - 个人信息表
- **Skill** - 技能表
- **Project** - 项目表
- **Experience** - 工作经历表
- **Learning** - 学习记录表
- **Life** - 生活动态表

### 数据库迁移

#### 创建新迁移

```bash
pnpm run prisma:migrate
```

#### 应用迁移（生产环境）

```bash
pnpm run prisma:migrate:deploy
```

#### 查看数据库（Prisma Studio）

```bash
pnpm run prisma:studio
```

访问 `http://localhost:5555` 查看数据库内容。

### 数据库连接测试

```bash
pnpm run test-db
```

---

## 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例 | 获取方法 |
|--------|------|------|----------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:pass@host:3306/db` | Railway: `${{MySQL.MYSQL_URL}}` |
| `JWT_SECRET` | JWT 签名密钥（用于签名和验证用户 Token） | 至少 32 字符的随机字符串 | 运行 `pnpm run generate-secret` |
| `NODE_ENV` | 环境模式 | `development` 或 `production` | 手动设置 |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` |
| `UPLOAD_DIR` | 文件上传目录 | `./uploads` (本地) / `/tmp/uploads` (生产) |
| `MAX_FILE_SIZE` | 最大文件大小（字节） | `10485760` (10MB) |
| `CORS_ORIGIN` | CORS 允许的源 | `http://localhost:3000` |

### 管理员配置变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` |
| `ADMIN_SKIP_CREATE` | 跳过创建管理员 | `false` |

---

## 部署后验证

### 1. 健康检查

```bash
curl https://your-domain.com/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. API 端点测试

#### 登录测试

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-password"
  }'
```

预期响应：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 获取个人信息

```bash
curl https://your-domain.com/api/profile
```

#### 获取项目列表

```bash
curl https://your-domain.com/api/projects
```

### 3. 数据库验证

使用 Prisma Studio 查看数据库：

```bash
pnpm run prisma:studio
```

### 4. 日志检查

#### Railway

1. 进入服务页面
2. 点击 **"Deployments"** 标签
3. 查看最新部署的日志

#### 本地

查看终端输出，确认：
- ✅ 服务器启动成功
- ✅ 数据库连接成功
- ✅ 迁移执行成功
- ✅ 管理员创建成功（如适用）

---

## 常见问题排查

### 问题 1: 数据库连接失败

**症状：**
```
Error: Can't reach database server
```

**解决方案：**

1. **Railway 部署：**
   - 检查 `DATABASE_URL` 是否使用 `${{MySQL.MYSQL_URL}}`
   - 确认 MySQL 服务状态为 "Running"
   - 检查数据库服务名称是否正确

2. **本地部署：**
   ```bash
   # 检查 MySQL 服务状态
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mysql
   
   # Windows
   # 检查服务管理器中的 MySQL 服务
   ```

3. **测试连接：**
   ```bash
   pnpm run test-db
   ```

### 问题 2: 端口被占用

**症状：**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案：**

```bash
# 查找占用端口的进程
# macOS/Linux
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# 终止进程
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

或修改 `.env` 中的 `PORT` 变量。

### 问题 3: JWT Secret 未设置或无效

**症状：**
```
Error: JWT_SECRET 必须在生产环境中设置
Error: 生产环境必须设置 JWT_SECRET
```

**解决方案：**

1. **生成新的 Secret：**
   ```bash
   pnpm run generate-secret
   ```
   这会生成一个 64 字符的随机密钥。

2. **设置到 Railway：**
   - 进入 Railway 项目 → 后端服务 → Variables
   - 添加变量 `JWT_SECRET`，值为生成的密钥
   - 保存后重新部署

3. **设置到本地环境：**
   - 编辑 `.env` 文件
   - 添加 `JWT_SECRET=生成的密钥`

**⚠️ 注意事项：**
- JWT Secret 必须至少 32 字符（推荐 64 字符）
- 不要使用示例密钥（如 `your-secret-key`）
- 生产环境和开发环境应使用不同的密钥
- 如果密钥泄露，立即更换并通知用户重新登录

### 问题 4: Prisma 迁移失败

**症状：**
```
Error: Migration failed
```

**解决方案：**

1. **检查数据库连接：**
   ```bash
   pnpm run test-db
   ```

2. **重置数据库（仅开发环境）：**
   ```bash
   pnpm run prisma:migrate reset
   ```

3. **手动应用迁移：**
   ```bash
   pnpm run prisma:migrate:deploy
   ```

### 问题 5: 文件上传失败

**症状：**
```
Error: 文件大小超过限制
```

**解决方案：**

1. 检查 `MAX_FILE_SIZE` 环境变量
2. 确认文件大小在限制内（默认 10MB）
3. 检查 `UPLOAD_DIR` 目录权限

### 问题 6: CORS 错误

**症状：**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解决方案：**

1. 在 Railway Variables 中设置 `CORS_ORIGIN`
2. 多个源用逗号分隔：
   ```bash
   CORS_ORIGIN=https://domain1.com,https://domain2.com
   ```

3. Railway 域名（`*.up.railway.app`）会自动允许，无需配置

### 问题 7: 管理员账号创建失败

**症状：**
```
Error: 用户名或邮箱已存在
```

**解决方案：**

1. 如果账号已存在，这是正常行为（脚本会跳过创建）
2. 要创建新管理员，修改 `ADMIN_USERNAME` 或 `ADMIN_EMAIL`
3. 或设置 `ADMIN_SKIP_CREATE=true` 跳过自动创建

### 问题 8: Railway 部署超时

**症状：**
```
Build timeout
```

**解决方案：**

1. 检查 `Dockerfile` 是否正确
2. 确认 `package.json` 中的脚本正确
3. 检查构建日志中的具体错误
4. 尝试增加 Railway 构建超时时间（在服务设置中）

---

## 生产环境最佳实践

### 1. 安全性

- ✅ 使用强密码作为 `JWT_SECRET`（至少 32 字符）
- ✅ 定期更新管理员密码
- ✅ 启用 HTTPS（Railway 自动提供）
- ✅ 限制 CORS 源，不要使用 `*`
- ✅ 定期备份数据库

### 2. 性能

- ✅ 使用 Railway 的自动扩展功能
- ✅ 配置适当的 `MAX_FILE_SIZE`
- ✅ 定期清理上传的文件
- ✅ 监控 API 响应时间

### 3. 监控

- ✅ 定期检查 Railway 部署日志
- ✅ 监控数据库连接状态
- ✅ 设置健康检查告警
- ✅ 跟踪 API 使用情况

### 4. 备份

#### Railway 数据库备份

1. 进入 MySQL 服务页面
2. 点击 **"Data"** 标签
3. 使用 **"Download Backup"** 功能

#### 手动备份

```bash
# 导出数据库
mysqldump -u root -p pathfinder > backup.sql

# 恢复数据库
mysql -u root -p pathfinder < backup.sql
```

---

## 更新部署

### Railway 自动更新

Railway 会在你推送代码到 GitHub 时自动触发部署。

### 手动触发部署

1. 进入 Railway 项目
2. 点击服务
3. 点击 **"Deployments"** → **"Redeploy"**

### 回滚部署

1. 进入 **"Deployments"** 标签
2. 找到之前的成功部署
3. 点击 **"Redeploy"**

---

## 技术支持

如遇到问题，请：

1. 查看本文档的 [常见问题排查](#常见问题排查) 部分
2. 检查 Railway 部署日志
3. 查看项目 GitHub Issues
4. 联系项目维护者

---

**最后更新：** 2024-01-01

**PathFinder Backend** - 为前端提供强大的 API 支持 🚀
