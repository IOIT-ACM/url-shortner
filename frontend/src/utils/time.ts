/**
 * Time formatting utilities
 */

/**
 * Format hours and minutes into a readable string
 * @example formatTimeRemaining(10, 15) => "10 hours 15 minutes"
 * @example formatTimeRemaining(1, 1) => "1 hour 1 minute"
 * @example formatTimeRemaining(0, 5) => "5 minutes"
 */
export function formatTimeRemaining(hours: number, minutes: number): string {
    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }

    if (minutes > 0 || hours === 0) {
        parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    }

    return parts.join(" ");
}

/**
 * Format seconds into HH:MM:SS display format
 */
export function formatCountdown(
    hours: number,
    minutes: number,
    seconds: number,
): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
