import { format, parseISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get the current time as ISO string
 */
export function getNowStr(): string {
  return new Date().toISOString();
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string, formatStr: string = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), formatStr);
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string for display with day name
 */
export function formatDayName(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE');
  } catch {
    return dateStr;
  }
}

/**
 * Get the difference in days between two dates
 */
export function getDateDiff(date1: string, date2: string): number {
  try {
    return differenceInDays(parseISO(date1), parseISO(date2));
  } catch {
    return 0;
  }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  try {
    return getDateDiff(date1, date2) === 0;
  } catch {
    return false;
  }
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  return isSameDay(dateStr, getTodayStr());
}

/**
 * Check if a date is in the past
 */
export function isPast(dateStr: string): boolean {
  return getDateDiff(getTodayStr(), dateStr) > 0;
}

/**
 * Get the last N days as date strings
 */
export function getLastNDays(days: number): string[] {
  const result: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    result.push(format(date, 'yyyy-MM-dd'));
  }

  return result;
}

/**
 * Get the week's dates as date strings (Monday to Sunday)
 */
export function getWeekDates(dateStr?: string): string[] {
  const baseDate = dateStr ? parseISO(dateStr) : new Date();
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }

  return dates;
}

/**
 * Get the month's dates as date strings
 */
export function getMonthDates(dateStr?: string): string[] {
  const baseDate = dateStr ? parseISO(dateStr) : new Date();
  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);
  const dates: string[] = [];
  const current = start;

  while (current <= end) {
    dates.push(format(current, 'yyyy-MM-dd'));
    addDays(current, 1);
  }

  return dates;
}

/**
 * Get a human-readable relative time string
 */
export function getRelativeTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}
