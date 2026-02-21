/**
 * Format a date object to a readable string
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (format === 'relative') {
    return formatRelativeDate(date);
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date relative to now (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes === 0) return 'just now';
      if (diffMinutes > 0) return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      return `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    return `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
  }

  if (diffDays > 0) return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days remaining until a deadline
 */
export function daysUntil(deadline: Date): number {
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the past
 */
export function isPastDeadline(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if deadline is within N days
 */
export function isDeadlineWithinDays(deadline: Date, days: number): boolean {
  const daysRemaining = daysUntil(deadline);
  return daysRemaining >= 0 && daysRemaining <= days;
}

/**
 * Calculate the notification date (48 hours before deadline)
 */
export function calculateNotificationDate(deadline: Date, hoursBefore: number = 48): Date {
  const notificationDate = new Date(deadline);
  notificationDate.setHours(notificationDate.getHours() - hoursBefore);
  return notificationDate;
}

/**
 * Format time remaining in a human-readable way
 */
export function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs < 0) {
    return 'Expired';
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Get urgency level based on time remaining
 */
export function getUrgencyLevel(deadline: Date): 'critical' | 'warning' | 'normal' | 'expired' {
  const daysRemaining = daysUntil(deadline);

  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 2) return 'critical';
  if (daysRemaining <= 7) return 'warning';
  return 'normal';
}

/**
 * Format receipt date from various formats
 */
export function parseReceiptDate(dateString: string): Date | null {
  // Try common receipt date formats
  const formats = [
    // ISO format
    /^\d{4}-\d{2}-\d{2}/,
    // US format: MM/DD/YYYY or MM/DD/YY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    // European format: DD/MM/YYYY
    /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,
  ];

  // Try parsing as ISO first
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try US format
  const usMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    let year = parseInt(usMatch[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }

  return null;
}
