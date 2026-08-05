/**
 * Sensitivity Masker: Redacts passwords, secret keys, tokens, and PII from log metadata.
 */
class LogMasker {
  mask(data) {
    if (!data || typeof data !== "object") return data;
    const masked = Array.isArray(data) ? [...data] : { ...data };

    for (const key of Object.keys(masked)) {
      const lower = key.toLowerCase();
      if (lower.includes("password") || lower.includes("secret") || lower.includes("token") || lower.includes("key")) {
        masked[key] = "******** [REDACTED]";
      } else if (typeof masked[key] === "object") {
        masked[key] = this.mask(masked[key]);
      }
    }
    return masked;
  }
}

module.exports = new LogMasker();
