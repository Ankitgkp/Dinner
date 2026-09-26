import { fit, hr, ORANGE, paint, truncate, visibleLength } from "./theme";

export function panel(title: string, rows: string[], width: number, color: boolean): string[] {
  const c = (code: string, v: string) => paint(color, code, v);
  const inner = width - 2;
  const topTitle = ` ${title} `;
  const top = `╭${topTitle}${hr(inner - visibleLength(topTitle))}╮`;
  const body = rows.map((row) => `│${fit(` ${row}`, inner)}│`);
  const bottom = `╰${hr(inner)}╯`;
  return [c(ORANGE, top), ...body, c(ORANGE, bottom)];
}

export function box(
  title: string,
  lines: readonly string[],
  options: { color?: boolean | undefined; width?: number | undefined } = {},
): string {
  const color = options.color ?? true;
  const width = Math.max(48, options.width ?? 86);
  const inner = width - 4;
  const header = ` ${title} `;
  const top = `╭${header}${hr(width - 2 - visibleLength(header))}╮`;
  const body = lines.map((line) => {
    const clipped = truncate(line, inner);
    return `│ ${fit(clipped, inner)} │`;
  });
  const bottom = `╰${hr(width - 2)}╯`;
  return [paint(color, ORANGE, top), ...body, paint(color, ORANGE, bottom)].join("\n");
}
