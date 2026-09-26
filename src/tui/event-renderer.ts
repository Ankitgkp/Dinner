import type { AgentEvent, AgentRunResult } from "../agent";
import { box } from "./box";
import { GOLD, GREEN, MAGENTA, paint, RED, YELLOW } from "./theme";

function valueOf(payload: unknown, key: string): unknown {
  if (typeof payload !== "object" || payload === null) return undefined;
  return (payload as Record<string, unknown>)[key];
}

function actionType(payload: unknown): string {
  const action = valueOf(payload, "action");
  if (typeof action === "object" && action !== null) {
    const type = (action as Record<string, unknown>).type;
    if (typeof type === "string") return type;
  }
  return typeof action === "string" ? action : "unknown";
}

function changedFiles(payload: unknown): string[] {
  const result = valueOf(payload, "result");
  if (typeof result !== "object" || result === null) return [];
  const value = (result as Record<string, unknown>).value;
  if (typeof value !== "object" || value === null) return [];
  const files = (value as Record<string, unknown>).changedFiles;
  return Array.isArray(files)
    ? files.filter((item): item is string => typeof item === "string")
    : [];
}

export function createTuiEventRenderer(
  write: (message: string) => void = console.log,
  options: { color?: boolean | undefined } = {},
): (event: AgentEvent) => void {
  const color = options.color ?? true;
  return (event) => {
    if (event.type === "run_started") {
      const workspace = valueOf(event.payload, "workspacePath");
      write(box("Run started", [
        `${paint(color, GREEN, "●")} Workspace: ${String(workspace ?? "unknown")}`,
        "The agent will inspect, edit, verify, inspect diff, then finish.",
      ], { color }));
      return;
    }

    if (event.type === "model_decision") {
      const intent = valueOf(event.payload, "intent");
      const type = actionType(event.payload);
      write(box(`Step ${event.sequence} · model`, [
        `${paint(color, MAGENTA, "thinking")}: ${String(intent ?? "choosing next action")}`,
        `${paint(color, GOLD, "action")}: ${type}`,
      ], { color }));
      return;
    }

    if (event.type === "model_error") {
      const kind = valueOf(event.payload, "kind");
      const message = valueOf(event.payload, "message");
      write(box(`Step ${event.sequence} · model error`, [
        `${paint(color, RED, "kind")}: ${String(kind ?? "unknown")}`,
        `${paint(color, RED, "message")}: ${String(message ?? "unknown")}`,
      ], { color }));
      return;
    }

    if (event.type === "tool_result") {
      const action = valueOf(event.payload, "action");
      const workspaceChanged = valueOf(event.payload, "workspaceChanged") === true;
      const files = changedFiles(event.payload);
      const result = valueOf(event.payload, "result");
      const ok = typeof result === "object" && result !== null &&
        (result as Record<string, unknown>).ok !== false;
      write(box(`Step ${event.sequence} · result`, [
        `${workspaceChanged ? paint(color, GREEN, "changed") : paint(color, YELLOW, "unchanged")}: ${String(action ?? "unknown")}`,
        `status: ${ok ? "ok" : "blocked/rejected"}`,
        files.length > 0 ? `files: ${files.join(", ")}` : "files: none",
      ], { color }));
      return;
    }

    if (event.type === "run_finished") {
      const status = valueOf(event.payload, "status");
      const reason = valueOf(event.payload, "terminationReason");
      const files = valueOf(event.payload, "changedFiles");
      write(box(`Run finished · ${String(status ?? "unknown")}`, [
        `reason: ${String(reason ?? "completed")}`,
        `changed files: ${Array.isArray(files) ? files.join(", ") || "none" : "unknown"}`,
      ], { color }));
    }
  };
}

export function renderRunSummary(
  result: AgentRunResult,
  options: { color?: boolean | undefined } = {},
): string {
  const color = options.color ?? true;
  return box("Final evidence", [
    `status: ${result.status}`,
    `reason: ${result.terminationReason}`,
    `changed files: ${result.changedFiles.join(", ") || "none"}`,
    `checks: ${result.verification.commandsRun}`,
    `tokens: ${result.usage.providerTotalTokens || result.usage.estimatedTotalTokens}`,
    `patch: ${result.patchPath}`,
    `report: ${result.reportPath}`,
  ], { color });
}
