/**
 * 日期工具函数
 */

/**
 * 格式化日期
 */
export function formatDate(
  date: Date,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 获取今天开始时间
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取今天结束时间
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 获取本周开始时间
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // 周一为一周开始
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取本周结束时间
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7); // 周日为一周结束
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 获取本月开始时间
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取本月结束时间
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 获取本年开始时间
 */
export function getStartOfYear(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取本年结束时间
 */
export function getEndOfYear(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 添加天数
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 添加小时
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * 添加分钟
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * 计算两个日期之间的小时差
 */
export function hoursBetween(date1: Date, date2: Date): number {
  const oneHour = 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneHour));
}

/**
 * 计算两个日期之间的分钟差
 */
export function minutesBetween(date1: Date, date2: Date): number {
  const oneMinute = 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneMinute));
}

/**
 * 判断是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 判断是否为今天
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 判断是否为昨天
 */
export function isYesterday(date: Date): boolean {
  const yesterday = addDays(new Date(), -1);
  return isSameDay(date, yesterday);
}

/**
 * 判断是否为明天
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
}

/**
 * 判断是否为工作日
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * 判断是否为周末
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return formatDate(date, 'YYYY-MM-DD');
  }
}

/**
 * 解析日期字符串
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * 验证日期是否有效
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
