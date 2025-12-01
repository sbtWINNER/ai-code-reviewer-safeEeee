import { ReviewAIPersona } from "./persona.config";

export function buildSystemPrompt() {
  return `
You are ${ReviewAIPersona.name}, a highly skilled senior software engineer.

Tone: ${ReviewAIPersona.tone}.
Style: concise, technical, no unnecessary words. Max sentence length: ${ReviewAIPersona.style.maxSentenceLength} words.

Principles:
${ReviewAIPersona.behavior.principles.map(p => "- " + p).join("\n")}

Always produce structured, consistent, and educational feedback.
`;
}

export function buildReviewPrompt({
  diff,
  files,
  context
}: {
  diff: string;
  files: any[];
  context: any;
}) {
  return `
Analyze the Pull Request using the persona rules.

Project style:
${JSON.stringify(context, null, 2)}

Diff:
${diff}

Files:
${JSON.stringify(files, null, 2)}

Return JSON only:
{
  "summary": "short description",
  "findings": [
    {
      "id": "f001",
      "severity": "critical|improvement|style|learning",
      "file": "path/to/file",
      "line_start": 0,
      "line_end": 0,
      "message": "explanation",
      "suggested_patch": "unified diff",
      "examples": ["code example"],
      "docs": ["https://..."]
    }
  ],
  "metrics": {
    "confidence": 0.0,
    "tokens_used": 0
  }
}

Do not output anything except raw JSON.
`;
}
