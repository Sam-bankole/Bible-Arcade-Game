// High-Precision Millisecond Timestamp Formatter & Parser

/**
 * Formats a JavaScript timestamp or Date object into HH:mm:ss.SSS string
 * Example: 09:54:14.584
 */
export function formatTimestamp(dateInput?: Date | number): string {
  const d = dateInput === undefined 
    ? new Date() 
    : typeof dateInput === 'number' 
      ? new Date(dateInput) 
      : dateInput;

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Calculates and formats elapsed stopwatch time since the round started
 * Example: +4.58s or +12.34s
 */
export function formatElapsedRoundTime(submitMs: number, startMs?: number): string {
  if (!startMs || submitMs < startMs) return '+0.00s';
  const diffMs = submitMs - startMs;
  const totalSeconds = (diffMs / 1000);
  if (totalSeconds < 60) {
    return `+${totalSeconds.toFixed(2)}s`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(2);
  return `+${mins}m ${secs}s`;
}

/**
 * Parses an HH:mm:ss.SSS string into total milliseconds since midnight of the current day
 * Allows re-sorting official timestamps accurately
 */
export function parseTimestampToMs(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;

  try {
    const parts = timeStr.trim().split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    const secParts = parts[2].split('.');
    const seconds = parseInt(secParts[0], 10) || 0;
    const ms = parseInt((secParts[1] || '0').padEnd(3, '0').slice(0, 3), 10) || 0;

    return ((hours * 3600 + minutes * 60 + seconds) * 1000) + ms;
  } catch {
    return 0;
  }
}

/**
 * Generates initial random default session code (e.g., 6 uppercase alphanumeric chars)
 */
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Normalizes user text answer for fuzzy matching / spelling verification
 */
export function normalizeAnswer(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}
