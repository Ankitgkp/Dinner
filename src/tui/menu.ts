import { readSync } from "node:fs";
import { box } from "./box";
import { BOLD, DIM, GOLD, MUTED, paint } from "./theme";

export interface SelectChoice {
  label: string;
  value: string;
  hint?: string | undefined;
}

export type TerminalSelector = (
  title: string,
  choices: readonly SelectChoice[],
  options?: { defaultIndex?: number | undefined; help?: string | undefined },
) => string | null;

export function renderSelectMenu(
  title: string,
  choices: readonly SelectChoice[],
  selectedIndex: number,
  options: { color?: boolean | undefined; help?: string | undefined; width?: number | undefined } = {},
): string {
  const color = options.color ?? true;
  const lines = [
    options.help ?? "Use ↑/↓ and Enter to select.",
    "",
    ...choices.map((choice, index) => {
      const selected = index === selectedIndex;
      const marker = selected ? paint(color, GOLD, "›") : " ";
      const label = selected ? paint(color, BOLD + GOLD, choice.label) : choice.label;
      const hint = choice.hint ? paint(color, DIM + MUTED, `  ${choice.hint}`) : "";
      return `${marker} ${label}${hint}`;
    }),
  ];
  return box(title, lines, { color, width: options.width ?? Math.min(92, process.stdout.columns ?? 92) });
}

export function createArrowKeySelector(options: {
  color?: boolean | undefined;
  input?: NodeJS.ReadStream | undefined;
  output?: NodeJS.WriteStream | undefined;
} = {}): TerminalSelector {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const color = options.color ?? true;

  return (title, choices, selectOptions = {}) => {
    if (choices.length === 0) return null;
    if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
      return choices[selectOptions.defaultIndex ?? 0]?.value ?? null;
    }

    let selected = Math.min(Math.max(selectOptions.defaultIndex ?? 0, 0), choices.length - 1);
    const render = () => {
      output.write("\u001b[2J\u001b[3J\u001b[H");
      output.write(renderSelectMenu(title, choices, selected, {
        color,
        width: output.columns,
        ...(selectOptions.help === undefined ? {} : { help: selectOptions.help }),
      }));
      output.write("\n");
    };

    const previousRawMode = input.isRaw;
    output.write("\u001b[?1049h\u001b[?25l");
    input.setRawMode(true);
    input.resume();
    render();

    const buffer = Buffer.alloc(8);
    try {
      while (true) {
        const fd = (input as { fd?: number }).fd ?? 0;
        const read = readSync(fd, buffer, 0, buffer.length, null);
        if (read <= 0) continue;
        const chunk = buffer.subarray(0, read).toString("utf8");

        if (chunk === "\u0003" || chunk === "\u001b") return null;
        if (chunk === "\r" || chunk === "\n") return choices[selected]?.value ?? null;
        if (chunk === "\u001b[A" || chunk === "k" || chunk === "\u001b[D" || chunk === "h") {
          selected = selected === 0 ? choices.length - 1 : selected - 1;
          render();
        } else if (chunk === "\u001b[B" || chunk === "j" || chunk === "\u001b[C" || chunk === "l") {
          selected = selected === choices.length - 1 ? 0 : selected + 1;
          render();
        } else if (/^[1-9]$/.test(chunk)) {
          const index = Number(chunk) - 1;
          if (index >= 0 && index < choices.length) {
            selected = index;
            render();
          }
        }
      }
    } finally {
      input.setRawMode(previousRawMode);
      output.write("\u001b[?25h\u001b[?1049l");
    }
  };
}
