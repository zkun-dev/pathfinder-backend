/**
 * 日期处理工具函数
 */

/**
 * 转换日期字段（用于 Prisma 数据准备）
 */
export function transformDateFields<T extends Record<string, unknown>>(
  data: T,
  dateFields: string[] = ['startDate', 'endDate']
): Partial<T> {
  const transformed: Partial<T> = { ...data };
  
  for (const field of dateFields) {
    if (field in data && data[field] !== undefined) {
      const value = data[field];
      if (typeof value === 'string' && value !== '') {
        transformed[field as keyof T] = new Date(value) as T[keyof T];
      } else if (value === '' || value === null) {
        transformed[field as keyof T] = null as T[keyof T];
      }
    }
  }
  
  return transformed;
}
