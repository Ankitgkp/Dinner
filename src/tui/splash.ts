import { readSync } from "node:fs";
import { panel } from "./box";
import {
  AMBER,
  BOLD,
  centerText,
  CREAM,
  DARK,
  fit,
  GOLD,
  hr,
  joinColumns,
  MUTED,
  ORANGE,
  paint,
  RED,
  SOFT,
  truncate,
  visibleLength,
} from "./theme";

export const LOGO = [
  " ██████╗ █████╗ ██████╗  █████╗ ███╗   ███╗███████╗██╗     ",
  "██╔════╝██╔══██╗██╔══██╗██╔══██╗████╗ ████║██╔════╝██║     ",
  "██║     ███████║██████╔╝███████║██╔████╔██║█████╗  ██║     ",
  "██║     ██╔══██║██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ██║     ",
  "╚██████╗██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║███████╗███████╗",
  " ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝",
];

export const TOOLS = [
  ["search", "web, docs, research, real-time info"],
  ["code", "read, write, edit, refactor"],
  ["execute", "run commands, notebooks, scripts"],
  ["browse", "open browser, click, fill, automate"],
  ["files", "manage files and directories"],
  ["git", "clone, commit, push, PR"],
  ["deploy", "build, deploy, monitor"],
  ["database", "query, analyze, manage"],
  ["apis", "integrate and test APIs"],
  ["tools", "extensions and custom tools"],
  ["memory", "remember context and preferences"],
] as const;

export const SKILLS = [
  ["planning", "break down tasks, create roadmap"],
  ["coding", "full-stack, scripts, automation"],
  ["debugging", "diagnose, fix, improve"],
  ["research", "deep research, summarise, compare"],
  ["data", "analyze, clean, visualize"],
  ["automation", "workflows, pipelines, integrations"],
  ["documentation", "write docs, README, guides"],
  ["testing", "tests, lint, eval, improve quality"],
  ["learning", "adapt to your style and codebase"],
  ["reasoning", "multi-step problem solving"],
  ["collaboration", "work with your tools and team"],
] as const;

export const QUICK = ["New Task", "Continue", "Settings", "Tools", "Help"] as const;

export interface SplashOptions {
  color?: boolean | undefined;
  width?: number | undefined;
  selectedQuickIndex?: number | undefined;
  cwd?: string | undefined;
  version?: string | undefined;
}

export function renderHero(width: number, color: boolean): string[] {
  const c = (code: string, v: string) => paint(color, code, v);
  const heroRight = [
    "",
    `${c(CREAM, "plan")}  ${c(AMBER, ">")}  ${c(CREAM, "think")}  ${c(AMBER, ">")}  ${c(CREAM, "code")}  ${c(AMBER, ">")}  ${c(CREAM, "execute")}  ${c(AMBER, ">")}  ${c(CREAM, "ship")}`,
    "",
    c(SOFT, "Your coding, research and automation"),
    c(SOFT, "companion — with a sweeter taste."),
  ];

  if (width < 100) {
    const compact = [
      ...LOGO.slice(0, 6).map((x) => c(GOLD, x)),
      c(GOLD, centerText("──  A I   A G E N T   F O R   S W E E T E R   W O R K F L O W S  ──", Math.min(width, 78))),
      "",
      ...heroRight,
    ];
    return compact;
  }

  const leftWidth = Math.min(74, Math.floor(width * 0.64));
  const rightWidth = Math.max(30, width - leftWidth - 4);
  const logo = LOGO.map((x) => c(GOLD, x));
  const left = [
    ...logo,
    c(GOLD, centerText("──  A I   A G E N T   F O R   S W E E T E R   W O R K F L O W S  ──", leftWidth)),
  ];
  const divider = c(ORANGE, "│");
  const right = heroRight.map((x) => truncate(x, rightWidth - 2));
  const rows = Math.max(left.length, right.length);
  const out: string[] = [];
  for (let i = 0; i < rows; i++) {
    const l = left[i] ?? "";
    const r = right[i] ?? "";
    out.push(`${fit(l, leftWidth)} ${divider} ${r}`);
  }
  return out;
}

export function renderInfoPanels(width: number, color: boolean): string[] {
  const c = (code: string, v: string) => paint(color, code, v);
  const toolRows = TOOLS.map(
    ([name, desc]) => `${c(GOLD, ">  " + name.padEnd(14))}${c(ORANGE, ":")}  ${c(MUTED, desc)}`,
  );
  const skillRows = SKILLS.map(
    ([name, desc]) => `${c(GOLD, ">  " + name.padEnd(16))}${c(ORANGE, ":")}  ${c(MUTED, desc)}`,
  );

  if (width >= 108) {
    const gap = 2;
    const leftWidth = Math.floor((width - gap) / 2);
    const rightWidth = width - gap - leftWidth;
    return joinColumns(
      panel("[ AVAILABLE TOOLS ]", toolRows, leftWidth, color),
      panel("[ AVAILABLE SKILLS ]", skillRows, rightWidth, color),
      leftWidth,
      gap,
    );
  }

  return [
    ...panel("[ AVAILABLE TOOLS ]", toolRows, width, color),
    "",
    ...panel("[ AVAILABLE SKILLS ]", skillRows, width, color),
  ];
}

export function renderQuickStart(width: number, selected: number, color: boolean): string[] {
  const c = (code: string, v: string) => paint(color, code, v);
  const title = c(GOLD, "[ QUICK START ]");

  if (width < 84) {
    const rows = QUICK.map((label, i) => {
      const active = i === selected;
      const prefix = active ? c(GOLD, "›") : " ";
      const number = c(GOLD, String(i + 1));
      const text = active ? c(BOLD + GOLD, label) : c(CREAM, label);
      return `${prefix} ${number}  ${text}`;
    });
    return panel("[ QUICK START ]", rows, width, color);
  }

  const inner = width - 2;
  const topTitle = ` ${title} `;
  const out = [c(ORANGE, `╭${topTitle}${hr(inner - visibleLength(topTitle))}╮`)];

  const gaps = "  │  ";
  const available = inner - 2 - visibleLength(gaps) * (QUICK.length - 1);
  const buttonWidth = Math.max(11, Math.floor(available / QUICK.length));
  const buttons = QUICK.map((label, i) => {
    const content = `${i + 1}  ${label}`;
    const centered = centerText(content, buttonWidth);
    if (i === selected) {
      return c(BOLD + GOLD, `▰${fit(centered, buttonWidth - 2)}▰`);
    }
    return c(ORANGE, `╭${hr(buttonWidth - 2)}╮`) + "\n" +
      c(CREAM, `│${fit(centered, buttonWidth - 2)}│`) + "\n" +
      c(ORANGE, `╰${hr(buttonWidth - 2)}╯`);
  });

  const split = buttons.map((b) => b.split("\n"));
  for (let row = 0; row < 3; row++) {
    const pieces = split.map((part) => part[row] ?? fit("", buttonWidth));
    out.push(`│ ${pieces.join(c(DARK, gaps))}${" ".repeat(Math.max(0, inner - 1 - visibleLength(pieces.join(gaps))))}│`);
  }
  out.push(c(ORANGE, `╰${hr(inner)}╯`));
  return out;
}

export function renderSplash(options: SplashOptions = {}): string {
  const color = options.color ?? true;
  const c = (code: string, v: string) => paint(color, code, v);
  const terminalWidth = options.width ?? process.stdout.columns ?? 120;
  const width = Math.max(68, Math.min(170, terminalWidth - 2));
  const inner = width - 2;
  const selected = Math.min(Math.max(options.selectedQuickIndex ?? 0, 0), QUICK.length - 1);
  const version = options.version ?? "v0.1.0";
  const cwd = options.cwd ?? process.cwd().replace(process.env.HOME ?? "", "~");

  const out: string[] = [];
  const top = `╭${hr(inner)}╮`;
  out.push(c(ORANGE, top));

  const topLeft = `${c(GOLD, "●")} ${c(ORANGE, "●")} ${c(RED, "●")}    ${c(GOLD, "~/caramel")}`;
  const topRight = c(GOLD, `Caramél Agent   ${version}`);
  const topGap = Math.max(1, inner - 2 - visibleLength(topLeft) - visibleLength(topRight));
  out.push(`│ ${topLeft}${" ".repeat(topGap)}${topRight} │`);
  out.push(c(ORANGE, `├${hr(inner)}┤`));

  for (const line of renderHero(inner - 2, color)) {
    out.push(`│ ${fit(line, inner - 2)} │`);
  }

  out.push(`│ ${fit("", inner - 2)} │`);

  for (const line of renderInfoPanels(inner - 2, color)) {
    out.push(`│ ${fit(line, inner - 2)} │`);
  }

  out.push(`│ ${fit("", inner - 2)} │`);

  for (const line of renderQuickStart(inner - 2, selected, color)) {
    out.push(`│ ${fit(line, inner - 2)} │`);
  }

  out.push(c(ORANGE, `├${hr(inner)}┤`));
  const statusLeft = `${c(GOLD, "caramel@agent")}  ${c(ORANGE, "│")}  ${c(CREAM, cwd)}  ${c(ORANGE, "│")}  ${c(GOLD, ">")} ${c(CREAM, "▌")}`;
  const statusRight = `${c(GOLD, "sweeter ideas, faster execution")} ${c(ORANGE, "✦")}`;
  const statusGap = Math.max(1, inner - 2 - visibleLength(statusLeft) - visibleLength(statusRight));
  out.push(`│ ${truncate(statusLeft, Math.max(1, inner - 3))}${" ".repeat(statusGap)}${truncate(statusRight, Math.max(0, inner - visibleLength(statusLeft) - statusGap - 2))} │`);
  out.push(c(ORANGE, `╰${hr(inner)}╯`));
  out.push("");
  out.push(c(MUTED, "Caramel AI Coding Harness"));

  return out.join("\n");
}

export type HomeAction = "new" | "continue" | "settings" | "tools" | "help";

export function createCaramelHomeSelector(options: {
  color?: boolean | undefined;
  input?: NodeJS.ReadStream | undefined;
  output?: NodeJS.WriteStream | undefined;
  cwd?: string | undefined;
  version?: string | undefined;
} = {}): () => HomeAction | null {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const color = options.color ?? true;
  const values: HomeAction[] = ["new", "continue", "settings", "tools", "help"];

  return () => {
    if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
      return "new";
    }

    let selected = 0;
    const previousRawMode = input.isRaw;
    const buffer = Buffer.alloc(16);

    const render = () => {
      output.write("\u001b[2J\u001b[3J\u001b[H");
      output.write(renderSplash({
        color,
        width: output.columns,
        selectedQuickIndex: selected,
        cwd: options.cwd,
        version: options.version,
      }));
      output.write("\n");
    };

    output.write("\u001b[?1049h\u001b[?25l");
    input.setRawMode(true);
    input.resume();
    render();

    try {
      while (true) {
        const fd = (input as { fd?: number }).fd ?? 0;
        const read = readSync(fd, buffer, 0, buffer.length, null);
        if (read <= 0) continue;
        const chunk = buffer.subarray(0, read).toString("utf8");

        if (chunk === "\u0003") return null;
        if (chunk === "\r" || chunk === "\n") return values[selected] ?? null;
        if (chunk === "\u001b") return null;

        if (chunk === "\u001b[D" || chunk === "h" || chunk === "\u001b[A" || chunk === "k") {
          selected = selected === 0 ? QUICK.length - 1 : selected - 1;
          render();
          continue;
        }
        if (chunk === "\u001b[C" || chunk === "l" || chunk === "\u001b[B" || chunk === "j") {
          selected = selected === QUICK.length - 1 ? 0 : selected + 1;
          render();
          continue;
        }
        if (/^[1-5]$/.test(chunk)) {
          selected = Number(chunk) - 1;
          render();
          continue;
        }
      }
    } finally {
      input.setRawMode(previousRawMode);
      output.write("\u001b[?25h\u001b[?1049l");
    }
  };
}
