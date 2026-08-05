class IdentityRiskEngine {
  /**
   * Calculates dynamic login risk score (0 - 100).
   */
  calculateRisk(loginContext = {}) {
    let riskScore = 10; // baseline

    if (loginContext.isNewDevice) riskScore += 25;
    if (loginContext.isUnusualHour) riskScore += 15;
    if (loginContext.failedAttempts > 3) riskScore += 30;

    let riskLevel = "LOW";
    if (riskScore >= 70) riskLevel = "HIGH";
    else if (riskScore >= 40) riskLevel = "MEDIUM";

    return {
      riskScore,
      riskLevel,
      triggers: riskScore > 10 ? ["Behavioral Anomaly Checked"] : [],
    };
  }
}

module.exports = new IdentityRiskEngine();
