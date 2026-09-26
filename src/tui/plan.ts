import type { AgentPlan, PlanQuestion } from "../agent";
import { box } from "./box";
import type { SelectChoice } from "./menu";
import { BOLD, CYAN, DIM, GREEN, paint } from "./theme";

export function renderPlanSummary(plan: { summary: string }, options: { color?: boolean | undefined } = {}): string {
  const color = options.color ?? true;
  return box("Plan", [
    paint(color, BOLD, "Agent's proposed approach:"),
    "",
    ...plan.summary.split("\n").map((line) => `  ${line}`),
    "",
    paint(color, DIM, "The agent will now ask clarifying questions."),
    paint(color, DIM, "Use ↑/↓ to select or type a custom answer."),
  ], { color, width: 92 });
}

export function renderPlanApproval(plan: AgentPlan, options: { color?: boolean | undefined } = {}): string {
  const color = options.color ?? true;
  const answerLines = plan.answers.map((answer) =>
    `  ${paint(color, CYAN, "•")} ${answer.question}: ${paint(color, BOLD, answer.answer)}${answer.isCustom ? paint(color, DIM, " (custom)") : ""}`,
  );
  return box("Plan Summary", [
    paint(color, BOLD, plan.summary),
    "",
    paint(color, GREEN, "Your decisions:"),
    ...answerLines,
  ], { color, width: 92 });
}

export function planQuestionToSelectChoices(question: PlanQuestion): SelectChoice[] {
  const choices: SelectChoice[] = question.options.map((option, index) => ({
    label: option,
    value: option,
    ...(index === (question.defaultIndex ?? 0) ? { hint: "recommended" } : {}),
  }));
  if (question.allowCustom) {
    choices.push({
      label: "✎ Custom answer…",
      value: "__plan_custom_answer__",
      hint: "type your own",
    });
  }
  return choices;
}
