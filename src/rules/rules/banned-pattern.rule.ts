import { Rule } from "../rule.engine.ts";

export const bannedPatternRule: Rule = {
  id: "banned_pattern",
  description: "Запрещённые паттерны в коде",
  severity: "critical",

  run(content, filePath) {
    const banned = ["eval(", "new Function("];
    const findings: any[] = [];

    banned.forEach(pattern => {
      if (content.includes(pattern)) {
        findings.push({
          ruleId: "banned_pattern",
          severity: "critical",
          file: filePath,
          line: 1,
          message: `Обнаружен запрещённый паттерн: ${pattern}`
        });
      }
    });

    return findings;
  }
};
