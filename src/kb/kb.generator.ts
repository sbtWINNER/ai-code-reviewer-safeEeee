import { KBAnalysis, KBPage } from "./kb.types";

export class KBGenerator {
  buildMistakesPage(repo: string, analysis: KBAnalysis): KBPage {
    const mistakes = analysis.topMistakes
      .slice(0, 10)
      .map(
        m => `### ${m.ruleId}\n- Count: ${m.count}\n- Severity: ${m.severity}\n`
      )
      .join("\n");

    return {
      repo,
      title: "Top 10 Mistakes in This Repository",
      content: `# Top 10 Mistakes\n\n${mistakes}`,
      source_findings: analysis.topMistakes.map(m => m.ruleId)
    };
  }

  buildBestPracticesPage(repo: string, analysis: KBAnalysis): KBPage {
    const best = analysis.bestPractices
      .slice(0, 10)
      .map(
        m => `### ${m.ruleId}\n- Occurrences: ${m.count}\n- Severity: ${m.severity}\n`
      )
      .join("\n");

    return {
      repo,
      title: "Best Practices & Patterns",
      content: `# Best Practices\n\n${best}`,
      source_findings: analysis.bestPractices.map(m => m.ruleId)
    };
  }
}
