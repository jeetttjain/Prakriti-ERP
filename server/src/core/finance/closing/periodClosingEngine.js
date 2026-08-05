const FinancialPeriod = require("../../../models/FinancialPeriod");
const eventPublisher = require("../../events/eventPublisher");

class PeriodClosingEngine {
  /**
   * Month-End and Year-End period closing execution.
   */
  async closePeriod(fiscalYear, month, userCode = "ADMIN-01", status = "SoftClosed") {
    const periodId = `PERIOD-${fiscalYear}-M${month}`;
    let period = await FinancialPeriod.findOne({ periodId });

    if (!period) {
      period = await FinancialPeriod.create({
        periodId,
        fiscalYear,
        month,
        status,
        closedBy: userCode,
        closedAt: new Date(),
      });
    } else {
      period.status = status;
      period.closedBy = userCode;
      period.closedAt = new Date();
      await period.save();
    }

    eventPublisher.publish("PERIOD_CLOSED", { periodId, fiscalYear, month, status }, { producerModule: "EFAP" }).catch(() => {});

    return period;
  }
}

module.exports = new PeriodClosingEngine();
