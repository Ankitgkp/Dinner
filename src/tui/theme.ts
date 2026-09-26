export const RESET = "\u001b[0m";
export const DIM = "\u001b[2m";
export const BOLD = "\u001b[1m";
export const INVERSE = "\u001b[7m";
export const GREEN = "\u001b[32m";
export const YELLOW = "\u001b[33m";
export const MAGENTA = "\u001b[35m";
export const CYAN = "\u001b[36m";
export const RED = "\u001b[31m";

// Caramél palette
export const GOLD = "\u001b[38;5;220m";
export const AMBER = "\u001b[38;5;214m";
export const ORANGE = "\u001b[38;5;208m";
export const CREAM = "\u001b[38;5;223m";
export const SOFT = "\u001b[38;5;250m";
export const MUTED = "\u001b[38;5;244m";
export const DARK = "\u001b[38;5;236m";

const ANSI_RE = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

export function paint(enabled: boolean, code: string, value: string): string {
  return enabled ? `${code}${value}${RESET}` : value;
}

export function stripAnsi(value: string): string {
  return value.replace(ANSI_RE, "");
}

export function visibleLength(value: string): number {
  return [...stripAnsi(value)].length;
}

export function padRight(value: string, width: number): string {
  return value + " ".repeat(Math.max(0, width - visibleLength(value)));
}

export function truncate(value: string, max: number): string {
  if (max <= 0) return "";
  if (visibleLength(value) <= max) return value;
  const plain = stripAnsi(value);
  return plain.slice(0, Math.max(0, max - 1)) + "…";
}

export function centerText(value: string, width: number): string {
  const left = Math.max(0, Math.floor((width - visibleLength(value)) / 2));
  return " ".repeat(left) + value;
}

export function fit(value: string, width: number): string {
  const clipped = truncate(value, width);
  return padRight(clipped, width);
}

export function hr(width: number, ch = "─"): string {
  return ch.repeat(Math.max(0, width));
}

export function joinColumns(left: string[], right: string[], leftWidth: number, gap = 2): string[] {
  const rows = Math.max(left.length, right.length);
  const out: string[] = [];
  for (let i = 0; i < rows; i++) {
    const l = left[i] ?? "";
    const r = right[i] ?? "";
    out.push(`${fit(l, leftWidth)}${" ".repeat(gap)}${r}`);
  }
  return out;
}
