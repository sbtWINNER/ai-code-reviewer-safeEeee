export interface RuleFinding {
  ruleId: string;
  severity: "critical" | "improvement" | "style" | "learning";
  file: string;
  line: number;
  message: string;
}

export interface Rule {
  id: string;
  description: string;
  severity: RuleFinding["severity"];
  run(content: string, filePath: string): RuleFinding[];
}

export class RuleEngine {
  constructor(private rules: Rule[]) {}

  run(fileContent: string, filePath: string): RuleFinding[] {
    const results: RuleFinding[] = [];

    for (const rule of this.rules) {
      try {
        const findings = rule.run(fileContent, filePath);
        results.push(...findings);
      } catch (e) {
        console.log("Rule error:", rule.id, e);
      }
    }

    return results;
  }
}
