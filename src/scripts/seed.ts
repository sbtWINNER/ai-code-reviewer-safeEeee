import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.repos.create({
    data: {
      owner: "test",
      name: "test-repo",
      prs: {
        create: {
          pr_number: 1,
          head_sha: "abc123",
          reviews: {
            create: {
              ai_version: "v1",
              summary: "Initial AI analysis",
              findings: [
                { message: "Use const instead of let", severity: "style" },
                { message: "Avoid nested loops", severity: "improvement" }
              ]
            }
          }
        }
      }
    }
  });

  console.log("✅ Тестовые данные добавлены");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
