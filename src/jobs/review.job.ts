import { Worker } from "bullmq";
import { config } from "../config/env";
import { GithubService } from "../services/github.service";
import { AIService } from "../services/ai.service";
import { SlackService } from "../services/slack.service";
import { logger } from "../config/logger";
import { loadRuleEngine } from "../rules/rule.loader";
import { KBService } from "../kb/kb.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

new Worker(
  "review-queue",
  async job => {
    const { repo, pr_number } = job.data;

    logger.info(`🚀 Starting review for ${repo} PR #${pr_number}`);

    const github = new GithubService();
    const slack = new SlackService();
    const ai = new AIService();
    const engine = loadRuleEngine();
    const kb = new KBService();

    // --- 1. Получаем данные PR
    const diff = await github.getPRDiff(repo, pr_number);
    const files = await github.getPRFiles(repo, pr_number);
    const context = await github.getProjectProfile(repo);

    // --- 2. Анализ AI
    const aiResult = await ai.review({ diff, files, context });

    // --- 3. Проверки по статическим правилам
    const staticFindings: any[] = [];
    for (const f of files) {
      const fileFindings = engine.run(f.patch || "", f.path);
      staticFindings.push(...fileFindings);
    }

    // --- 4. Объединяем результаты
    const aiFindings = Array.isArray((aiResult as any).findings)
      ? (aiResult as any).findings
      : (Array.isArray((aiResult as any).comments) ? (aiResult as any).comments : []).map((c: any, i: number) => ({
          id: `ai_${i}`,
          severity: (c.severity as string) || "info",
          file: c.file || c.path || "",
          line_start: c.line || null,
          line_end: c.line || null,
          message: c.text || c.body || "",
          suggested_patch: "",
          examples: [],
          docs: []
        }));

    const combined = {
      ...aiResult,
      findings: [
        ...aiFindings,
        ...staticFindings.map(f => ({
          id: "rule_" + f.ruleId,
          severity: f.severity,
          file: f.file,
          line_start: f.line,
          line_end: f.line,
          message: f.message,
          suggested_patch: "",
          examples: [],
          docs: []
        }))
      ]
    };

    // --- 5. Сохраняем результат ревью в БД
    try {
      const [owner, name] = repo.split("/");

      // Проверяем, есть ли репозиторий
      let repoRecord = await prisma.repos.findFirst({
        where: { owner, name }
      });

      // Если нет — создаём
      if (!repoRecord) {
        repoRecord = await prisma.repos.create({
          data: { owner, name }
        });
        logger.info(`[DB] 🆕 Created new repo record for ${repo}`);
      }

      // Создаём PR-запись
      const prRecord = await prisma.pR.create({
        data: {
          repo_id: repoRecord.id,
          pr_number,
          head_sha: "unknown",
          last_review_at: new Date(),
          status: "completed"
        }
      });

      // Сохраняем само ревью
      await prisma.review.create({
        data: {
          pr_id: prRecord.id,
          ai_version: "gpt-5",
          summary: combined.summary,
          findings: combined.findings,
          feedback: {}
        }
      });

      logger.info(`[DB] ✅ Review saved for PR #${pr_number}`);
    } catch (err) {
      logger.error(`[DB] ❌ Failed to save review for ${repo}: ${err}`);
    }

    // --- 6. Отправляем отчёт в Slack
    try {
      await slack.postReviewResult({
        repo,
        pr_number,
        result: combined
      });
      logger.info(`[Slack] ✅ Review report sent for ${repo} PR #${pr_number}`);
    } catch (err) {
      logger.error(`[Slack] ❌ Failed to send Slack message: ${err}`);
    }

    // --- 7. Обновляем базу знаний
    try {
      await kb.generateForRepo(repo);
      logger.info(`[KBService] ✅ Knowledge base updated for ${repo}`);
    } catch (err) {
      logger.error(`[KBService] ❌ Failed to update KB for ${repo}: ${err}`);
    }

    logger.info(`✅ Completed review for PR #${pr_number}`);
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT
    }
  }
);
