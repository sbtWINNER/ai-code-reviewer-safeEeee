// src/services/ai.service.ts
import fetch from "node-fetch";

export class AIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set in env");
    }
  }

  // Вход: { diff: string, files: any[], context: any }
  // Выход: { summary: string, comments: Array<{file:string,line:number,text:string}> }
  async review({ diff, files, context }: { diff: string; files: any[]; context: any }) {
    const shortDiff = diff && diff.length > 12000 ? diff.slice(0, 12000) : diff;
    const fileList = files?.slice(0, 20).map((f: any) => ({ filename: f.filename, patch: (f.patch || "").slice(0, 2000) })) || [];

    const system = `
You are an expert senior software engineer and code reviewer.
You will receive a diff and several file patches. Provide:
1) a short summary of main issues/fixes (field "summary")
2) an array "comments" with items { "file": "<path>", "line": <lineNumber or null>, "text": "<comment text>" }.
Return ONLY valid JSON object with keys: summary, comments.
Comments should be precise, actionable, and short (<=300 chars). Use "file" values matching filenames provided.
Do not return extra text outside JSON.
`;

    const user = `
Context: ${JSON.stringify(context || {}).slice(0, 2000)}
Diff (partial): ${shortDiff}
Files (partial): ${JSON.stringify(fileList)}
`;

    const body = {
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      max_tokens: 1000,
      temperature: 0.0
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${txt}`);
    }

    // Приводим ответ к any, чтобы TypeScript не ругался
    const data: any = await res.json();
    const text: string = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";

    // Парсим JSON из ответа — AI должен вернуть JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(jsonText);
      const summary = parsed.summary || "";
      const comments = Array.isArray(parsed.comments) ? parsed.comments : [];
      return { summary, comments };
    } catch (err) {
      // fallback: вернуть текст как summary, пустой comments
      return { summary: text.slice(0, 4000), comments: [] };
    }
  }
}
