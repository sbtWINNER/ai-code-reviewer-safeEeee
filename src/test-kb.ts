import { KBService } from "./kb/kb.service.ts";

const kb = new KBService();

(async () => {
  await kb.generateForRepo("test/test-repo");
  const pages = await kb.listPages("test/test-repo");
  console.log("KB Pages:", pages);
})();
