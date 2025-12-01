import express from "express";
import crypto from "crypto";
import { Queue } from "bullmq";
import bodyParser from "body-parser";
import { config } from "../config/env";

const app = express();

// КРИТИЧНО: Сохраняем raw body для проверки подписи
app.use(
  bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// === Redis queue ===
const reviewQueue = new Queue("review-queue", {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
});

// === Health check ===
app.get("/", (req, res) => {
  res.status(200).send("Webhook server is running!");
});

// === GitHub webhook endpoint ===
app.post("/webhook/github", async (req, res) => {
  try {
    // Логируем все заголовки для диагностики
    console.log("📨 All headers:", JSON.stringify(req.headers, null, 2));
    
    const signature = req.headers["x-hub-signature-256"] as string;
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "";

    console.log("🔑 Secret from env:", secret ? `${secret.substring(0, 5)}...` : "NOT SET");

    // ИСПРАВЛЕНИЕ: Используем req.rawBody вместо JSON.stringify(req.body)
    if (!req.rawBody) {
      console.error("❌ Raw body is missing");
      return res.status(400).send("Bad request: raw body missing");
    }

    // Если подпись отсутствует - проверяем IP источника (ngrok может удалять заголовки)
    if (!signature) {
      console.warn("⚠️ WARNING: No x-hub-signature-256 header found!");
      console.warn("⚠️ Ngrok Free plan may strip security headers");
      
      // Проверяем что запрос от GitHub по IP
      const forwardedFor = req.headers["x-forwarded-for"] as string;
      const githubIp = forwardedFor?.split(",")[0].trim();
      
      if (githubIp) {
        console.log(`🔍 Request from IP: ${githubIp}`);
        // GitHub Webhook IP ranges: 140.82.112.0/20, 143.55.64.0/20, 192.30.252.0/22
        // Для продакшена нужно проверять полный список: https://api.github.com/meta
        const isGitHubIP = githubIp.startsWith("140.82.") || 
                          githubIp.startsWith("143.55.") || 
                          githubIp.startsWith("192.30.");
        
        if (!isGitHubIP) {
          console.error(`❌ Request not from GitHub IP: ${githubIp}`);
          return res.status(403).send("Forbidden: Invalid source IP");
        }
        console.log("✅ Request verified via GitHub IP");
      }
      
      console.warn("⚠️ Processing webhook WITHOUT HMAC signature (development mode)");
    } else {
      const hmac = crypto
        .createHmac("sha256", secret)
        .update(req.rawBody) // Используем сырое тело
        .digest("hex");

      const expected = `sha256=${hmac}`;

      console.log("📝 GitHub signature:", signature);
      console.log("📝 Expected signature:", expected);
      console.log("✅ Match:", signature === expected);

      if (signature !== expected) {
        console.warn("❌ Invalid signature");
        return res.status(403).send("Invalid signature");
      }

      console.log("✅ Signature verified");
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`📦 Event type: ${event}`);

    if (event === "pull_request" && payload.action === "opened") {
      const repo = payload.repository.full_name;
      const pr_number = payload.pull_request.number;

      await reviewQueue.add("review", { repo, pr_number });
      console.log(`✅ Added PR #${pr_number} from ${repo} to review queue`);
    } else if (event === "ping") {
      console.log("🏓 Ping event received");
    } else {
      console.log(`ℹ️ Event ${event} (action: ${payload.action || "N/A"}) - not processed`);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).send("Error");
  }
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
  console.log(`⚠️ 404: ${req.method} ${req.path}`);
  res.status(404).send("Not Found");
});

const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Webhook server running at http://${HOST}:${PORT}`);
});