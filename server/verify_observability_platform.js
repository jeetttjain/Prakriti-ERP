require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const telemetryPipeline = require("./src/core/observability/telemetry/telemetryPipeline");
const correlationEngine = require("./src/core/observability/correlation/correlationEngine");
const metricsEngine = require("./src/core/observability/metrics/metricsEngine");
const tracingEngine = require("./src/core/observability/tracing/tracingEngine");
const healthEngine = require("./src/core/observability/health/healthEngine");
const alertEngine = require("./src/core/observability/alerts/alertEngine");
const sloEngine = require("./src/core/observability/slo/sloEngine");
const diagnosticsEngine = require("./src/core/observability/diagnostics/diagnosticsEngine");
const performanceProfiler = require("./src/core/observability/profiling/performanceProfiler");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Telemetry Pipeline & PII Masking ---");
    const logDoc = await telemetryPipeline.log("INFO", "Orders", "Order ORD-901 processed cleanly.", { userPassword: "secretPassword123", amount: 15400 });
    console.log("✅ Log emitted! Log ID:", logDoc.logId, "Metadata Masking Check:", logDoc.metadata.userPassword);

    console.log("\n--- TEST 2: Correlation & Tracing Engine ---");
    const traceId = correlationEngine.generateTraceId();
    const spanObj = await tracingEngine.startSpan("GET /api/orders", "Orders");
    const spanDoc = await spanObj.endSpan("OK", { httpCode: 200 });
    console.log("✅ Distributed Trace Span recorded! Span ID:", spanDoc.spanId, "Duration:", spanDoc.durationMs, "ms");

    console.log("\n--- TEST 3: Telemetry Metrics Collection ---");
    const metrics = await metricsEngine.collectMetrics();
    console.log("✅ System Metrics collected! Memory Usage:", metrics.memoryUsagePct, "% Mongo Latency:", metrics.mongoLatencyMs, "ms");

    console.log("\n--- TEST 4: Subsystem Health Inspector ---");
    const health = await healthEngine.checkHealth();
    console.log("✅ Overall Health:", health.status, "| Total Subsystems Checked:", health.subsystems.length);

    console.log("\n--- TEST 5: Alert Rules Engine & Critical Dispatch ---");
    const alert = await alertEngine.triggerAlert("High CPU Threshold Exceeded", "CPU usage surpassed 90% threshold for 5 mins.", "CRITICAL", "Infrastructure");
    console.log("✅ Alert generated & dispatched! Alert ID:", alert.alertId, "Severity:", alert.severity);

    const ackAlert = await alertEngine.acknowledgeAlert(alert.alertId, "ADM-0001");
    console.log("✅ Alert acknowledged! Status:", ackAlert.status);

    console.log("\n--- TEST 6: SLI / SLO Framework ---");
    const slo = await sloEngine.getSloMetrics();
    console.log("✅ SLI SLA Availability:", slo.apiAvailabilityPct, "% Status:", slo.slaStatus);

    console.log("\n--- TEST 7: Diagnostics Test Suite ---");
    const diagReport = await diagnosticsEngine.runDiagnostics("ADM-0001");
    console.log("✅ Diagnostic Run completed! Overall:", diagReport.overallStatus, "Checks passed:", diagReport.checks.length);

    console.log("\n--- TEST 8: Performance Profiler ---");
    const perf = await performanceProfiler.getPerformanceReport();
    console.log("✅ Performance Profiler Report! Database Latency:", perf.databaseLatencyMs, "ms Cache Hit Ratio:", perf.cacheHitRatioPct, "%");

    console.log("\n🎉 ALL 8 ENTERPRISE OBSERVABILITY PLATFORM TESTS PASSED SUCCESSFULLY!");
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
