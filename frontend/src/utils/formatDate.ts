import { format, formatDistanceToNow } from "date-fns";

/**
 * Formats a given date string or Date object to a human-readable full datetime string.
 * Example output: "September 10, 2025 2:30 PM"
 *
 * @param dateStr Date string or Date object to format
 * @returns Formatted datetime string
 */
export function formatFullDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return format(date, "MMMM d, yyyy h:mm a");
}

/**
 * Returns a relative time string for a given date to now.
 * Example output: "5 minutes ago", "3 days ago"
 *
 * @param dateStr Date string or Date object to compare with now
 * @param addSuffix Whether to add suffix like 'ago' or 'in'. Default true.
 * @returns Relative time string
 */
export function formatRelativeTime(
  dateStr: string | Date,
  addSuffix = true
): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return formatDistanceToNow(date, { addSuffix });
}
