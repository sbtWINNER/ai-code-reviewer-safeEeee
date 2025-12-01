import { Rule } from "../rule.engine.ts";

export const longFunctionRule: Rule = {
  id: "long_function",
  description: "Функции должны быть короче 50 строк",
  severity: "improvement",

  run(content, filePath) {
    const findings: any[] = [];
    const lines = content.split("\n");

    let functionStart: number | null = null;

    lines.forEach((line, index) => {
      if (line.includes("function ") || line.includes("=> {")) {
        functionStart = index;
      }

      if (functionStart !== null && line.includes("}")) {
        const length = index - functionStart;
        if (length > 50) {
          findings.push({
            ruleId: "long_function",
            severity: "improvement",
            file: filePath,
            line: index,
            message: `Функция слишком длинная (${length} строк).`
          });
        }
        functionStart = null;
      }
    });

    return findings;
  }
};
