export interface KBPage {
  id?: string;
  repo: string;
  title: string;
  content: string; // Markdown
  source_findings: string[];
}

export interface KBMetric {
  ruleId: string;
  count: number;
  severity: string;
}

export interface KBAnalysis {
  topMistakes: KBMetric[];
  bestPractices: KBMetric[];
}
