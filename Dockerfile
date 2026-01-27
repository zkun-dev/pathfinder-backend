# ============================================
# 构建阶段
# ============================================
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache openssl openssl-dev && \
    npm install -g pnpm@latest

WORKDIR /app

# 复制依赖文件（利用 Docker 层缓存）
COPY package.json pnpm-lock.yaml ./

# 复制 Prisma schema（postinstall 需要它来生成 Prisma Client）
COPY prisma ./prisma

# 安装依赖（postinstall 会自动运行 prisma generate）
RUN pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm run build

# ============================================
# 生产镜像
# ============================================
FROM node:18-alpine

# 安装运行时依赖
RUN apk add --no-cache openssl openssl-dev && \
    npm install -g pnpm@latest

WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/scripts ./scripts

# 创建上传目录（Railway 使用 /tmp/uploads，但保留此步骤以防需要）
RUN mkdir -p uploads

# 暴露端口（Railway 会自动设置 PORT 环境变量）
EXPOSE ${PORT:-3001}

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3001) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
# 1. 运行数据库迁移
# 2. 创建管理员账号（可通过 ADMIN_SKIP_CREATE=true 跳过）
# 3. 启动服务器
CMD ["sh", "-c", "pnpm run prisma:migrate:deploy && node scripts/create-admin.js && node dist/app.js"]
