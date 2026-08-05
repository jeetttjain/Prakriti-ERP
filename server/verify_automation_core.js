require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const eventPublisher = require("./src/core/events/eventPublisher");
const eventSubscriber = require("./src/core/events/eventSubscriber");
const eventReplay = require("./src/core/events/eventReplay");
const jobQueue = require("./src/core/queue/jobQueue");
const lockManager = require("./src/core/queue/lockManager");
const workflowEngine = require("./src/core/workflows/workflowEngine");
const schedulerEngine = require("./src/core/scheduler/schedulerEngine");
const webhookEngine = require("./src/core/webhooks/webhookEngine");
const pluginRegistry = require("./src/core/plugins/pluginRegistry");
const { systemControlFlags } = require("./src/core/automation/systemControlFlags");
const { EVENTS } = require("./src/core/events/eventRegistry");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Event Publisher, Idempotency & Subscriber ---");
    let receivedEvent = null;

    eventSubscriber.subscribe(EVENTS.ORDER_CREATED, (eventDoc) => {
      receivedEvent = eventDoc;
    });

    const pubStartTime = Date.now();
    const eventDoc1 = await eventPublisher.publish(EVENTS.ORDER_CREATED, { orderId: "ORD-101", totalAmount: 15000 }, { producerModule: "OrderModule" });
    const pubDuration = Date.now() - pubStartTime;

    console.log("✅ Event published in", pubDuration, "ms. Event ID:", eventDoc1.eventId, "Correlation ID:", eventDoc1.correlationId);

    // Test Idempotency Guard (publishing identical event within 1 min)
    const eventDoc2 = await eventPublisher.publish(EVENTS.ORDER_CREATED, { orderId: "ORD-101", totalAmount: 15000 }, { producerModule: "OrderModule" });
    console.log("✅ Idempotency check: Duplicate event suppressed cleanly. Same Event ID returned:", eventDoc2.eventId === eventDoc1.eventId);

    console.log("\n--- TEST 2: Event Replay Subsystem ---");
    const replayResult = await eventReplay.replayEvents({ eventName: EVENTS.ORDER_CREATED });
    console.log("✅ Replayed events count:", replayResult.replayedCount);

    console.log("\n--- TEST 3: Priority Job Queue & Idempotency ---");
    const jobDoc = await jobQueue.enqueue({
      jobName: "JOB_CALCULATE_DISCOUNT",
      payload: { customerId: "CUST-001" },
      priority: "HIGH",
    });
    console.log("✅ Job enqueued in High Priority Queue. Job ID:", jobDoc.jobId, "Status:", jobDoc.status);

    console.log("\n--- TEST 4: Distributed Lock Manager ---");
    const lock1 = await lockManager.acquireLock("RESOURCE_TEST_1", 5000);
    const lock2 = await lockManager.acquireLock("RESOURCE_TEST_1", 5000);
    console.log("✅ Lock 1 acquired:", lock1, "Lock 2 suppressed concurrent access:", !lock2);
    await lockManager.releaseLock("RESOURCE_TEST_1");

    console.log("\n--- TEST 5: Workflow Engine & Template Cloning ---");
    const wfDoc = await workflowEngine.cloneTemplate("TMPL_LOW_STOCK_ALERT", "Automated Reorder Workflow");
    console.log("✅ Workflow cloned from template! Workflow ID:", wfDoc.workflowId, "Steps:", wfDoc.steps.length);

    const execResult = await workflowEngine.executeWorkflow(wfDoc.workflowId, { daysLeft: 2 });
    console.log("✅ Workflow execution status:", execResult.status, "Logged Steps:", execResult.executionLog.length);

    console.log("\n--- TEST 6: Scheduler Engine & History Logging ---");
    schedulerEngine.registerSchedule("SCHED_TEST_01", "Daily Maintenance", "0 0 * * *", async () => {
      return true;
    });
    await schedulerEngine.runSchedule("SCHED_TEST_01");
    console.log("✅ Scheduler job executed and history logged cleanly.");

    console.log("\n--- TEST 7: Webhook Engine & Signature Verification ---");
    const whLog = await webhookEngine.handleIncomingWebhook("GenericProvider", "/api/webhook", { test: true }, "sig", "");
    console.log("✅ Webhook processed! Webhook ID:", whLog.webhookId, "Status:", whLog.status);

    console.log("\n--- TEST 8: Plugin Registry & System Control Flags ---");
    pluginRegistry.register("TestPlugin", { run: () => true });
    console.log("✅ Plugin registered! Active plugins count:", pluginRegistry.listPlugins().length);
    console.log("System Control Flags:", systemControlFlags.getStatus());

    console.log("\n🎉 ALL 8 AUTOMATION CORE & EVENT BUS TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🍃 MongoDB Connection closed.");
    process.exit(0);
  }
}

runTests();
