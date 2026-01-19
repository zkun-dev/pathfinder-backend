import { Request } from 'express';

/**
 * 扩展的请求类型，包含用户ID
 */
export interface AuthRequest extends Request {
  userId?: number;
}

/**
 * Prisma 错误类型
 */
export interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    cause?: string;
  };
}

/**
 * API 响应类型
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 通用查询参数
 */
export interface QueryParams {
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

/**
 * JSON 类型（用于 Prisma JSON 字段）
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}
