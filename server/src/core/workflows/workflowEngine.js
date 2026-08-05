const WorkflowDef = require("../../models/WorkflowDef");
const TEMPLATES = require("./workflowTemplates");

class WorkflowEngine {
  /**
   * Evaluates workflow steps in sequential chain.
   */
  async executeWorkflow(workflowId, payload = {}) {
    const workflow = await WorkflowDef.findOne({ workflowId });
    if (!workflow || workflow.status !== "Published") {
      return { status: "SKIPPED", reason: "Workflow not published or missing." };
    }

    const executionLog = [];
    let currentStepIndex = 0;

    while (currentStepIndex < workflow.steps.length) {
      const step = workflow.steps[currentStepIndex];
      const stepResult = await this.executeStep(step, payload);
      executionLog.push({ stepId: step.stepId, type: step.type, result: stepResult });

      if (step.type === "Finish") break;
      if (step.type === "Condition" && !stepResult.passed) {
        // Jump to Else step if present
        const elseStepIdx = workflow.steps.findIndex((s) => s.type === "Else");
        if (elseStepIdx !== -1) currentStepIndex = elseStepIdx;
        else break;
      } else {
        currentStepIndex++;
      }
    }

    workflow.executionCount += 1;
    await workflow.save();

    return {
      status: "COMPLETED",
      workflowId,
      executionLog,
    };
  }

  async executeStep(step, payload) {
    switch (step.type) {
      case "Trigger":
        return { passed: true, event: step.config.event };
      case "Condition":
        return { passed: true, condition: step.config };
      case "Action":
        return { passed: true, action: step.config.actionType };
      case "Delay":
        return { passed: true, delayedMs: step.config.duration || 0 };
      default:
        return { passed: true };
    }
  }

  /**
   * Clones a template into a published workflow document.
   */
  async cloneTemplate(templateId, customName) {
    const tmpl = TEMPLATES.find((t) => t.templateId === templateId);
    if (!tmpl) throw new Error("Template not found.");

    const workflowId = `WF-${Date.now()}`;
    return WorkflowDef.create({
      workflowId,
      name: customName || tmpl.name,
      description: tmpl.description,
      triggerEvent: tmpl.triggerEvent,
      steps: tmpl.steps,
      status: "Published",
    });
  }
}

module.exports = new WorkflowEngine();
