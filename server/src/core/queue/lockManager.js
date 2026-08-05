/**
 * Distributed Lock Manager for Job, Workflow, and Scheduler concurrency control.
 */
class LockManager {
  constructor() {
    this.locks = new Map();
  }

  /**
   * Acquires a lock with TTL (time to live in ms).
   */
  async acquireLock(resourceKey, ttlMs = 30000) {
    const now = Date.now();
    const existing = this.locks.get(resourceKey);

    if (existing && existing.expiresAt > now) {
      return false; // Lock already held
    }

    this.locks.set(resourceKey, {
      acquiredAt: now,
      expiresAt: now + ttlMs,
    });
    return true;
  }

  /**
   * Releases an acquired lock.
   */
  async releaseLock(resourceKey) {
    this.locks.delete(resourceKey);
  }

  /**
   * Checks if a resource key is currently locked.
   */
  isLocked(resourceKey) {
    const existing = this.locks.get(resourceKey);
    return Boolean(existing && existing.expiresAt > Date.now());
  }
}

module.exports = new LockManager();
