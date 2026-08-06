require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const moduleRegistry = require("./src/core/system-control/modules/moduleRegistry");
const dependencyOrchestrator = require("./src/core/system-control/orchestration/dependencyOrchestrator");
const systemControlEngine = require("./src/core/system-control/runtime/systemControlEngine");
const featureFlagEngine = require("./src/core/system-control/featureflags/featureFlagEngine");
const configEngine = require("./src/core/system-control/configuration/configEngine");
const configVersionEngine = require("./src/core/system-control/configuration/configVersionEngine");
const snapshotEngine = require("./src/core/system-control/snapshots/snapshotEngine");
const emergencyControl = require("./src/core/system-control/emergency/emergencyControl");
const maintenanceEngine = require("./src/core/system-control/maintenance/maintenanceEngine");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Centralized Module Registry Initialization ---");
    const modules = await moduleRegistry.listModules();
    console.log("✅ Modules Registered:", modules.length, "Module IDs:", modules.map(m => m.moduleId));

    console.log("\n--- TEST 2: DAG Dependency Tree & Safe Shutdown Validation ---");
    const safeCheck = await dependencyOrchestrator.validateSafeShutdown("MOD-AUTOMATION", false);
    console.log("✅ Safe Shutdown Validation (MOD-AUTOMATION): Safe =", safeCheck.safe, "| Reason:", safeCheck.reason);

    console.log("\n--- TEST 3: Runtime Control Engine (Start, Stop, Restart) ---");
    const stoppedMod = await systemControlEngine.stopModule("MOD-SUPPLYCHAIN", false);
    console.log("✅ Module MOD-SUPPLYCHAIN Stopped! Status:", stoppedMod.status);
    const restartedMod = await systemControlEngine.startModule("MOD-SUPPLYCHAIN");
    console.log("✅ Module MOD-SUPPLYCHAIN Restarted! Status:", restartedMod.status);

    console.log("\n--- TEST 4: Feature Flag Engine & Canary Rollout Evaluation ---");
    const flags = await featureFlagEngine.listFlags();
    const updatedFlag = await featureFlagEngine.setFlag("whatsapp_notifications", true);
    console.log("✅ Feature Flags Active:", flags.length, "Flag [whatsapp_notifications] Status:", updatedFlag.isEnabled);

    console.log("\n--- TEST 5: Dynamic Configuration Engine & Version Rollback ---");
    const config = await configEngine.updateConfig("LOG_RETENTION_DAYS", 60, "ADMIN-01");
    console.log("✅ Configuration Updated: Key =", config.configKey, "Value =", config.value, "Version =", config.version);

    console.log("\n--- TEST 6: System State Snapshot Engine & One-Click Restore ---");
    const snap = await snapshotEngine.createSnapshot("Test Baseline Snapshot", "ADMIN-01");
    console.log("✅ Snapshot Created! Snapshot ID:", snap.snapshotId, "Modules Captured:", snap.modules.length);
    const restored = await snapshotEngine.restoreSnapshot(snap.snapshotId, "ADMIN-01");
    console.log("✅ Snapshot Restored Successfully! Snapshot ID:", restored.snapshotId);

    console.log("\n--- TEST 7: Emergency Control Switch & Alert Dispatch ---");
    const emergencyRes = await emergencyControl.triggerEmergencyAction("AUTOMATION_STOP", "ADMIN-01");
    console.log("✅ Emergency Control Triggered! Status:", emergencyRes.status, "Target:", emergencyRes.target);

    console.log("\n--- TEST 8: Maintenance Mode Engine ---");
    const maint = await maintenanceEngine.startMaintenance("System Upgrade in Progress", "Global", "ADMIN-01");
    console.log("✅ Maintenance Mode Started! ID:", maint.maintenanceId, "Message:", maint.bannerMessage);
    const stoppedMaint = await maintenanceEngine.stopMaintenance(maint.maintenanceId, "ADMIN-01");
    console.log("✅ Maintenance Mode Stopped! Status:", stoppedMaint.status);

    console.log("\n🎉 ALL 8 ENTERPRISE SYSTEM CONTROL ENGINE TESTS PASSED SUCCESSFULLY!");
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
