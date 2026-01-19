/**
 * 解析并验证 ID 参数
 * @param id ID 字符串
 * @returns 解析后的数字 ID，如果无效则返回 null
 */
export function parseId(id: string | undefined): number | null {
  if (!id) return null;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

/**
 * 验证 ID 并抛出错误（如果无效）
 */
export function validateId(id: string | undefined): number {
  const parsed = parseId(id);
  if (parsed === null) {
    throw new Error('无效的 ID 参数');
  }
  return parsed;
}

/**
 * 验证布尔字符串
 */
export function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true';
}
