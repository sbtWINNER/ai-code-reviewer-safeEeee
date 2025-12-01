export class SecretRedactor {
  private patterns = [
    /api[_-]?key\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
    /secret\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
    /token\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
    /password\s*=\s*['"].+?['"]/gi,
    /Authorization:\s*Bearer\s+[A-Za-z0-9\.\-_]+/gi,
    /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/gi,
    /AKIA[0-9A-Z]{16}/g, // AWS Access Key
    /[A-Za-z0-9_\-]{32,}==/g, // Base64-like secrets
    /xoxp-[a-zA-Z0-9-]{10,}/g, // Slack tokens
    /xoxb-[a-zA-Z0-9-]{10,}/g
  ];

  redact(text: string): string {
    let result = text;
    for (const p of this.patterns) {
      result = result.replace(p, "[REDACTED]");
    }
    return result;
  }
}

export const secretRedactor = new SecretRedactor();
