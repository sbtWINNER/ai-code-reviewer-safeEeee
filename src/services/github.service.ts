// src/services/github.service.ts
import { Octokit } from "@octokit/rest";

export class GithubService {
  private octokit: Octokit;

  constructor() {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN not set in env");
    }
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }

  // Получаем raw diff (строка)
  async getPRDiff(repoFullName: string, prNumber: number) {
    const [owner, repo] = repoFullName.split("/");
    const res = await this.octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner,
        repo,
        pull_number: prNumber,
        headers: { accept: "application/vnd.github.v3.diff" },
      }
    );
    return typeof res.data === "string" ? res.data : "";
  }

  // Получаем список файлов PR (массив с {filename, patch, status, additions, deletions})
  async getPRFiles(repoFullName: string, prNumber: number) {
    const [owner, repo] = repoFullName.split("/");
    const files: any[] = [];
    let page = 1;
    // пагинация
    while (true) {
      const res = await this.octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100,
        page,
      });
      if (!res.data || res.data.length === 0) break;
      files.push(...res.data.map(f => ({
        filename: f.filename,
        patch: f.patch,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions
      })));
      if (res.data.length < 100) break;
      page++;
    }
    return files;
  }

  // Базовый профиль проекта (вытаскиваем package.json если есть)
  async getProjectProfile(repoFullName: string) {
    const [owner, repo] = repoFullName.split("/");
    try {
      const res = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: "package.json",
      });
      // res.data может быть объектом с content (base64)
      // @ts-ignore
      if (res.data && (res.data as any).content) {
        // @ts-ignore
        const content = Buffer.from((res.data as any).content, "base64").toString("utf8");
        return { packageJson: JSON.parse(content) };
      }
    } catch (err) {
      // игнорируем — файл может отсутствовать
    }
    // fallback: общая информация о репо
    const repoInfo = await this.octokit.rest.repos.get({ owner, repo });
    return {
      name: repoInfo.data.name,
      description: repoInfo.data.description,
      default_branch: repoInfo.data.default_branch,
    };
  }

  // Публикация review с несколькими inline-комментариями
  async createReview(repoFullName: string, prNumber: number, payload: {
    body: string;
    event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
    comments?: Array<{ path: string; line?: number; body: string; side?: string }>;
  }) {
    const [owner, repo] = repoFullName.split("/");
    return this.octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
      owner,
      repo,
      pull_number: prNumber,
      body: payload.body,
      event: payload.event || "COMMENT",
      comments: payload.comments || []
    });
  }

  // Публикация простого (summary) комментария в PR (issues API)
  async createPRComment(repoFullName: string, prNumber: number, body: string) {
    const [owner, repo] = repoFullName.split("/");
    return this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body
    });
  }
}
