/**
 * 数据转换工具
 */

/**
 * 转换 Prisma 模型为 API 响应格式（移除敏感字段）
 */
export function sanitizeUser(user: { id: number; username: string; email: string; password: string; createdAt: Date; updatedAt: Date }) {
  const { password, ...sanitized } = user;
  return sanitized;
}
