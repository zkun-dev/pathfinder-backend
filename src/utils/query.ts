/**
 * 构建查询条件（支持字符串到布尔值的转换）
 * 自动排除分页参数（page, limit）和其他非查询字段
 */
export function buildQueryConditions(
  query: Record<string, string | undefined>,
  fieldMappings: Record<string, (value: string) => unknown> = {}
): Record<string, unknown> {
  const conditions: Record<string, unknown> = {};
  const excludedKeys = ['page', 'limit', 'skip', 'take', 'sort', 'order', 'orderBy'];
  
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '' || excludedKeys.includes(key)) {
      continue;
    }
    
    if (fieldMappings[key]) {
      const mappedValue = fieldMappings[key](value);
      if (mappedValue !== undefined) {
        conditions[key] = mappedValue;
      }
    } else {
      conditions[key] = value;
    }
  }
  
  return conditions;
}
