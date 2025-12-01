import { StaticRule, RuleFinding } from "./rule.types";

export const namingRules: StaticRule[] = [
  {
    id: "var_camel_case",
    description: "Variables should use camelCase naming.",
    severity: "improvement",

    check(content: string, file: string): RuleFinding[] {
      const findings: RuleFinding[] = [];

      const varDecl = /\b(let|const|var)\s+([A-Za-z0-9_]+)/g;
      let match;

      while ((match = varDecl.exec(content)) !== null) {
        const name = match[2];

        const isCamel = /^[a-z][a-zA-Z0-9]*$/.test(name);
        if (!isCamel) {
          findings.push({
            ruleId: "var_camel_case",
            file,
            message: `Variable "${name}" should use camelCase.`,
            severity: "improvement",
            line: content.slice(0, match.index).split("\n").length
          });
        }
      }

      return findings;
    }
  },

  {
    id: "class_pascal_case",
    description: "Class names should use PascalCase naming.",
    severity: "style",

    check(content: string, file: string): RuleFinding[] {
      const findings: RuleFinding[] = [];
      const classDecl = /\bclass\s+([A-Za-z0-9_]+)/g;

      let match;
      while ((match = classDecl.exec(content)) !== null) {
        const name = match[1];

        const isPascal = /^[A-Z][a-zA-Z0-9]*$/.test(name);
        if (!isPascal) {
          findings.push({
            ruleId: "class_pascal_case",
            file,
            message: `Class "${name}" must follow PascalCase naming.`,
            severity: "style",
            line: content.slice(0, match.index).split("\n").length
          });
        }
      }

      return findings;
    }
  }
];
