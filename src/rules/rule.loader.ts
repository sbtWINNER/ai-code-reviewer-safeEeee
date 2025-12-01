import { RuleEngine } from "./rule.engine";
import { noConsoleRule } from "./rules/no-console.rule";
import { longFunctionRule } from "./rules/long-function.rule";
import { bannedPatternRule } from "./rules/banned-pattern.rule";

export function loadRuleEngine() {
  return new RuleEngine([
    noConsoleRule,
    longFunctionRule,
    bannedPatternRule
  ]);
}
