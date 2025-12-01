import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class KBService {
  private countMistakes(messages: string[]) {
    const map = new Map<string, number>();

    for (const msg of messages) {
      map.set(msg, (map.get(msg) || 0) + 1);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([msg, count]) => ({ msg, count }));
  }

  private extractBestPractices(messages: string[]) {
    const unique = new Set(messages);
    return Array.from(unique).slice(0, 10);
  }

  /** Генерация базы знаний по репозиторию */
  async generateForRepo(repo: string) {
    // Находим все ревью связанные с этим repo
    const reviews = await prisma.review.findMany({
      where: {
        pr: {
          repo: {
            profile: {
              repo: repo
            }
          }
        }
      },
      include: { pr: true }
    });

    if (!reviews.length) {
      console.warn(`[KBService] Нет ревью для ${repo}`);
      return;
    }

    // Собираем все сообщения
    const allFindings = reviews.flatMap((r: any) => (r.findings as any[]) || []);
    const messages = allFindings.map((f: any) => f.message || "").filter(Boolean);

    // Генерируем статистику
    const mistakes = this.countMistakes(messages);
    const bestPractices = this.extractBestPractices(messages);

    // Сохраняем в базу
    await prisma.kBPage.create({
      data: {
        repo,
        type: "mistakes",
        title: "Top 10 mistakes",
        content: JSON.stringify(mistakes),
        sourceIds: []
      }
    });

    await prisma.kBPage.create({
      data: {
        repo,
        type: "best_practices",
        title: "Best practices",
        content: JSON.stringify(bestPractices),
        sourceIds: []
      }
    });

    console.log(`[KBService] KB generated for ${repo}`);
  }

  /** Получение страниц базы знаний */
  async listPages(repo: string) {
    return prisma.kBPage.findMany({
      where: { repo },
      orderBy: { updatedAt: "desc" }
    });
  }
}
