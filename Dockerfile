# 使用官方 Node.js 18 镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm@latest

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建 TypeScript
RUN pnpm run build

# 生成 Prisma Client
RUN pnpm run prisma:generate

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@latest

# 只复制生产依赖和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口（Railway 会自动映射，这里使用环境变量 PORT）
EXPOSE ${PORT:-3001}

# 健康检查（使用环境变量 PORT）
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3001) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用（先运行数据库迁移，再启动服务）
# Railway 会自动设置 PORT 环境变量
CMD ["sh", "-c", "pnpm run prisma:migrate:deploy && node dist/app.js"]
