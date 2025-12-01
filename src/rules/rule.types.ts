export type RuleSeverity = "critical" | "improvement" | "style" | "info";

export interface StaticRule {
  id: string;
  description: string;
  severity: RuleSeverity;

  /**
   * Возвращает список обнаруженных проблем
   */
  check(content: string, filePath: string): RuleFinding[];
}

export interface RuleFinding {
  ruleId: string;
  file: string;
  message: string;
  severity: RuleSeverity;
  line: number;
}
