const JournalEntry = require("../../../models/JournalEntry");
const ledgerEngine = require("../ledger/ledgerEngine");
const financialRulesEngine = require("../rules/financialRulesEngine");
const eventPublisher = require("../../events/eventPublisher");

class JournalEngine {
  /**
   * Posts a double-entry journal entry with strict Debit == Credit validation.
   */
  async postJournal(narration, lines, userCode = "SYSTEM") {
    const validation = financialRulesEngine.evaluateJournalPostingRules(lines);
    const journalId = `JRNL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const journalDoc = await JournalEntry.create({
      journalId,
      narration,
      lines,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: "Posted",
      approvalStatus: "Approved",
      createdBy: userCode,
    });

    // Update General Ledger for each line
    for (const line of lines) {
      await ledgerEngine.postToLedger(
        line.accountCode,
        journalId,
        line.debit || 0,
        line.credit || 0,
        line.description || narration
      );
    }

    // Emit JOURNAL_POSTED event to Phase 7.3A Event Bus
    eventPublisher.publish("JOURNAL_POSTED", { journalId, totalAmount: validation.totalDebit }, { producerModule: "EFAP" }).catch(() => {});

    return journalDoc;
  }
}

module.exports = new JournalEngine();
