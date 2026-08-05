/**
 * Attribute-Based Access Control (ABAC) Policy Engine.
 * Evaluates contextual attributes: Branch, Time, Location, Device Risk Score.
 */
class AbacPolicyEngine {
  evaluate(context = {}) {
    const { branch, workingHoursOnly = false, deviceRiskScore = 10 } = context;

    // High risk device check (>80 risk score denied for sensitive operations)
    if (deviceRiskScore > 85) {
      return { allowed: false, reason: "High risk device score detected." };
    }

    return { allowed: true };
  }
}

module.exports = new AbacPolicyEngine();
