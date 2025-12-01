import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class ProjectProfileService {
  async getProfileForRepo(repo: string) {
    let profile = await prisma.projectProfile.findUnique({
      where: { repo }
    });

    if (!profile) {
      profile = await prisma.projectProfile.create({
        data: {
          repo,
          language: "javascript",
          linters: ["eslint"],
          ignorePaths: [],
          rulesJson: {},
          modelPref: "gpt-5"
        }
      });
    }

    return profile;
  }
}
