import { Review } from "@prisma/client";
import { KBMetric } from "./kb.types";

export function computeMetrics(reviews: Review[]): KBMetric[] {
  const map: Record<string, KBMetric> = {};

  reviews.forEach(review => {
    const findings = (review.findings as any[]) || [];

    findings.forEach(f => {
      const ruleId = f.id || "unknown";

      if (!map[ruleId]) {
        map[ruleId] = {
          ruleId,
          severity: f.severity,
          count: 0
        };
      }

      map[ruleId].count++;
    });
  });

  return Object.values(map).sort((a, b) => b.count - a.count);
}
