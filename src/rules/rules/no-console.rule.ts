import { Rule } from "../rule.engine.ts";

export const noConsoleRule: Rule = {
  id: "no_console",
  description: "Console.log запрещён в продакшене",
  severity: "style",

  run(content, filePath) {
    const findings: any[] = [];
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      if (line.includes("console.log(")) {
        findings.push({
          ruleId: "no_console",
          severity: "style",
          file: filePath,
          line: index + 1,
          message: "Использование console.log запрещено."
        });
      }
    });

    return findings;
  }
};
