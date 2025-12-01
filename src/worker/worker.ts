// src/worker/worker.ts
import { Worker } from "bullmq";
import { config } from "../config/env";
import { GithubService } from "../services/github.service";
import { AIService } from "../services/ai.service";
import { logger } from "../config/logger";
import { db } from "../services/db";
import { TelegramService } from "../services/telegram.service";

const github = new GithubService();
const ai = new AIService();

const reviewWorker = new Worker(
  "review-queue",
  async (job: any) => {
    try {
      const { repo, pr_number } = job.data;
      logger.info(`🤖 Начинаем ревью PR #${pr_number} в ${repo}...`);

      // 1. Получаем diff и список файлов
      const diff = await github.getPRDiff(repo, pr_number);
      const files = await github.getPRFiles(repo, pr_number);
      const context = await github.getProjectProfile(repo);

      // 2. Анализируем код через AI
      const aiResult = await ai.review({ diff, files, context });

      if (!aiResult) {
        logger.warn("AI возвратил пустой результат");
      } else {
        logger.info(`🧠 AI сгенерировал результат (summary length=${(aiResult.summary||"").length})`);
      }

      // === Автоматическая вставка комментариев в PR (с fallback) ===
      let publishedInline = false;
      try {
        if (aiResult?.comments && Array.isArray(aiResult.comments) && aiResult.comments.length > 0) {
          // безопасное ограничение — публикуем не более 50 комментариев за один ревью
          const commentsToPost = aiResult.comments.slice(0, 50).map((c: any) => ({
            path: c.file || c.filename || c.path,
            body: `[AI] ${c.text || c.comment || c.body}`,
            // GitHub reviews API expects "position" (diff position). We keep null here and rely on the service to map if possible.
            // If your GithubService needs 'position', implement mapping there.
            line: c.line || null,
            side: "RIGHT"
          }));

          const filtered = commentsToPost.filter((x: any) => x.path);

          if (filtered.length > 0) {
            await github.createReview(repo, pr_number, {
              body: "AI Code Review completed.",
              event: "COMMENT",
              comments: filtered
            });
            publishedInline = true;
            logger.info(`💬 Опубликовано ${filtered.length} AI-комментариев в PR #${pr_number}`);
          } else {
            logger.info("ℹ️ Нет корректных комментариев для публикации");
          }
        } else {
          logger.info("ℹ️ Нет inline-комментариев от AI для публикации");
        }
      } catch (err: any) {
        // Если GitHub отказывает из-за позиции/формата комментариев — логируем и делаем fallback
        logger.error(`❌ Ошибка при публикации inline-комментариев: ${err?.message || err}`);
      }

      // Fallback: если inline-комментарии не были опубликованы, добавляем summary как обычный комментарий в PR
      if (!publishedInline) {
        try {
          const summary = aiResult?.summary ? aiResult.summary.slice(0, 4000) : "AI review finished: no summary.";
          await github.createPRComment(repo, pr_number, `**AI Code Review**\n\n${summary}`);
          logger.info("📝 Опубликован summary-комментарий в PR (fallback)");
        } catch (err: any) {
          logger.error(`❌ Не удалось опубликовать fallback summary в PR: ${err?.message || err}`);
        }
      }

      // Сохраняем результат ревью в БД (минимальная запись)
      try {
        const summary = aiResult?.summary ? aiResult.summary : null;
        await db.query(
          "INSERT INTO reviews(repo, pr, summary, created_at) VALUES ($1, $2, $3, now())",
          [repo, pr_number, summary]
        );
        logger.info("💾 Review сохранён в БД");
      } catch (err: any) {
        logger.error(`❌ Ошибка при сохранении в БД: ${err?.message || err}`);
      }

      // Отправляем Telegram-уведомление (краткий summary)
      try {
        const text = aiResult?.summary
          ? aiResult.summary.slice(0, 800)
          : "AI review finished, but no summary was provided.";
        await TelegramService.send(
          `✅ *AI review finished*\nRepo: ${repo}\nPR: #${pr_number}\n\n${text}`
        );
        logger.info("📨 Telegram-уведомление отправлено");
      } catch (err: any) {
        logger.error(`❌ Ошибка при отправке Telegram-уведомления: ${err?.message || err}`);
      }

      logger.info(`✅ Review для PR #${pr_number} завершен успешно`);
      return aiResult;
    } catch (err: any) {
      logger.error(`❌ Ошибка при ревью: ${err?.message || err}`);
      throw err;
    }
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
  }
);

logger.info("🚀 Reviewer worker запущен и слушает очередь 'review-queue'...");

export { reviewWorker };
