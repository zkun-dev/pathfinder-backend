import { QueryParams } from '../types/index.js';

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * 解析分页参数
 * @param query 查询参数
 * @param defaultLimit 默认每页数量
 * @param maxLimit 最大每页数量
 */
export function parsePagination(
  query: QueryParams,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit || String(defaultLimit), 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * 计算总页数
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit) || 1;
}

/**
 * 创建分页响应
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
) {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: calculateTotalPages(total, pagination.limit),
    },
  };
}
