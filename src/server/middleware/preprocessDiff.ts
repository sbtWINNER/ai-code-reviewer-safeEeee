export class DiffPreprocessor {
  maxLines = 2000;

  clean(diff: string): string {
    if (!diff) return "";

    // Удаляем бинарные изменения
    diff = diff.replace(/Binary files .* differ/g, "[BINARY FILE REDACTED]");

    // Обрезаем слишком большие diff
    const lines = diff.split("\n");
    if (lines.length > this.maxLines) {
      return (
        lines.slice(0, this.maxLines).join("\n") +
        `\n[DIFF TRUNCATED — ${lines.length - this.maxLines} lines removed]`
      );
    }

    return diff;
  }
}

export const diffPreprocessor = new DiffPreprocessor();
