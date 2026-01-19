# 使用官方 Node.js 运行时作为基础镜像
FROM node:20-alpine AS base

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS build

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN pnpm run prisma:generate

# 构建 TypeScript
RUN pnpm run build

# 生产阶段
FROM base AS production

# 只复制必要的文件
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/uploads ./uploads

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "dist/app.js"]
