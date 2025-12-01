import axios from "axios";

async function simulatePR() {
  const webhookURL = "http://localhost:4000/webhook/github";

  const payload = {
    action: "opened",
    repository: { full_name: "user/repo" }, // измени на свой репо
    pull_request: { number: 1 } // номер тестового PR
  };

  try {
    const res = await axios.post(webhookURL, payload, {
      headers: {
        "X-GitHub-Event": "pull_request",
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Webhook simulated:", res.status, res.data);
  } catch (err) {
    console.error("❌ Error simulating webhook:", err);
  }
}

simulatePR();
