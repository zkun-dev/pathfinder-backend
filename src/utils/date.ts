/**
 * 日期处理工具函数
 */

/**
 * 转换日期字段（用于 Prisma 数据准备）
 * 处理空字符串、null 和有效的日期字符串
 */
export function transformDateFields<T extends Record<string, unknown>>(
  data: T,
  dateFields: string[] = ['startDate', 'endDate']
): Partial<T> {
  const transformed: Partial<T> = { ...data };
  
  for (const field of dateFields) {
    if (!(field in data)) {
      continue;
    }
    
    const value = data[field];
    
    // 空字符串或 null 转换为 null
    if (value === '' || value === null || value === undefined) {
      transformed[field as keyof T] = null as T[keyof T];
      continue;
    }
    
    // 字符串转换为 Date 对象
    if (typeof value === 'string') {
      const date = new Date(value);
      // 验证日期是否有效
      if (isNaN(date.getTime())) {
        throw new Error(`无效的日期格式: ${field} = "${value}"`);
      }
      transformed[field as keyof T] = date as T[keyof T];
    }
    // 如果已经是 Date 对象，保持不变
    else if (value instanceof Date) {
      transformed[field as keyof T] = value as T[keyof T];
    }
  }
  
  return transformed;
}
