export function buildSlackReviewMessage({ repo, pr_number, result, duration }: { repo: string; pr_number: number; result: any; duration?: number }) {
  return {
    channel: process.env.SLACK_CHANNEL_ID,

    text: `AI Review for PR #${pr_number}`,

    // Slack metadata (будет доступно при нажатии кнопок)
    metadata: {
      event_type: "ai_review",
      event_payload: JSON.stringify(result)
    },

    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `AI Review • PR #${pr_number} — ${repo} — ${duration}s`
        }
      },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Summary:* ${result.summary}`
        }
      },

      { type: "divider" },

      ...result.findings.slice(0, 10).map((f: any) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${f.severity.toUpperCase()}* in \`${f.file}:${f.line_start}\`\n${f.message}`
        }
      })),

      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Post to PR" },
            action_id: "post_to_pr",
            value: JSON.stringify({ repo, pr_number })
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Mark false positive" },
            action_id: "mark_false_positive",
            style: "danger",
            value: JSON.stringify({ repo, pr_number })
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Improve AI" },
            action_id: "improve_ai",
            value: JSON.stringify({ repo, pr_number })
          }
        ]
      }
    ]
  };
}
