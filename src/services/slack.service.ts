import axios from "axios";
import { config } from "../config/env.ts";
import { buildSlackReviewMessage } from "./slack.message.ts";

export class SlackService {
  async postReviewResult({ repo, pr_number, result }) {
    const duration = Math.round(Math.random() * 10 + 5);

    const payload: any = buildSlackReviewMessage({
      repo,
      pr_number,
      result,
      duration
    });

    // Отправка в Slack
    await axios.post("https://slack.com/api/chat.postMessage", payload, {
      headers: {
        Authorization: `Bearer ${config.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
  }
}
