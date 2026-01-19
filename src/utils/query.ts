import { Prisma } from '@prisma/client';

/**
 * 构建 Prisma where 条件
 */
export interface WhereBuilderOptions {
  deletedAt?: boolean; // 是否包含 deletedAt: null
  [key: string]: unknown;
}

/**
 * 构建基础的 where 条件（包含软删除过滤）
 */
export function buildWhereClause(options: WhereBuilderOptions = {}): Prisma.JsonObject {
  const where: Prisma.JsonObject = {};
  
  // 默认过滤已删除的记录
  if (options.deletedAt !== false) {
    where.deletedAt = null;
  }
  
  // 添加其他条件
  Object.keys(options).forEach(key => {
    if (key !== 'deletedAt' && options[key] !== undefined && options[key] !== null) {
      where[key] = options[key];
    }
  });
  
  return where;
}

/**
 * 构建查询条件（支持字符串到布尔值的转换）
 * 自动排除分页参数（page, limit）和其他非查询字段
 */
export function buildQueryConditions(
  query: Record<string, string | undefined>,
  fieldMappings: Record<string, (value: string) => unknown> = {}
): Record<string, unknown> {
  const conditions: Record<string, unknown> = {};
  
  // 需要排除的参数（分页参数和其他非查询字段）
  const excludedKeys = ['page', 'limit', 'skip', 'take', 'sort', 'order', 'orderBy'];
  
  for (const [key, value] of Object.entries(query)) {
    // 跳过未定义的值、空值和排除的键
    if (value === undefined || value === '' || excludedKeys.includes(key)) {
      continue;
    }
    
    if (fieldMappings[key]) {
      const mappedValue = fieldMappings[key](value);
      // 只添加非 undefined 的映射值
      if (mappedValue !== undefined) {
        conditions[key] = mappedValue;
      }
    } else {
      conditions[key] = value;
    }
  }
  
  return conditions;
}
