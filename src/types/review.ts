export interface Finding {
  id: string;
  severity: "critical" | "improvement" | "style" | "learning";
  file: string;
  line_start: number;
  line_end: number;
  message: string;
  suggested_patch: string;
  examples: string[];
  docs: string[];
}

export interface ReviewResponse {
  summary: string;
  findings: Finding[];
  metrics: {
    confidence: number;
    tokens_used: number;
  };
}
