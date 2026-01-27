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

/**
 * 验证日期字符串
 * @param dateStr 日期字符串
 * @returns 如果有效返回 Date 对象，否则返回 null
 */
export function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr || dateStr === '') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * 验证 URL 字符串
 * @param url URL 字符串
 * @returns 如果有效返回 true，否则返回 false
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url || url === '') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}