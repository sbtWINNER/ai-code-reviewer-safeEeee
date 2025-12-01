import { RuleEngine } from "./rule.engine.ts";
import { noConsoleRule } from "./rules/no-console.rule.ts";
import { longFunctionRule } from "./rules/long-function.rule.ts";
import { bannedPatternRule } from "./rules/banned-pattern.rule.ts";

export function loadRuleEngine() {
  return new RuleEngine([
    noConsoleRule,
    longFunctionRule,
    bannedPatternRule
  ]);
}
