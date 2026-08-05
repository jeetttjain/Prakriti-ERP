require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const authenticationEngine = require("./src/core/identity/authentication/authenticationEngine");
const identityProviderRegistry = require("./src/core/identity/authentication/identityProviderRegistry");
const tokenEngine = require("./src/core/identity/tokens/tokenEngine");
const authorizationEngine = require("./src/core/identity/authorization/authorizationEngine");
const permissionRegistry = require("./src/core/identity/authorization/permissionRegistry");
const sessionManager = require("./src/core/identity/sessions/sessionManager");
const deviceManager = require("./src/core/identity/devices/deviceManager");
const apiKeyManager = require("./src/core/identity/apikeys/apiKeyManager");
const identityRiskEngine = require("./src/core/identity/risk/identityRiskEngine");
const identityAudit = require("./src/core/identity/audit/identityAudit");
const User = require("./src/models/User");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Identity Provider Registry & Abstraction ---");
    const providers = identityProviderRegistry.listProviders();
    console.log("✅ Registered Identity Providers:", providers);

    console.log("\n--- TEST 2: Centralized Authentication & Token Generation ---");
    const bcrypt = require("bcrypt");
    const testPasswordHash = await bcrypt.hash("admin123", 10);
    let testUser = await User.findOne({ userCode: "IAM-TEST-01" });
    if (!testUser) {
      const Role = require("./src/models/Role");
      let adminRole = await Role.findOne({ roleName: "Admin" }) || await Role.findOne({});
      if (!adminRole) {
        adminRole = await Role.create({ roleName: "Admin", permissions: { Orders: { view: true, create: true, edit: true, delete: true } } });
      }
      testUser = await User.create({
        userCode: "IAM-TEST-01",
        name: "IAM Test Admin",
        email: "iamtest@prakriti.com",
        password: testPasswordHash,
        roleId: adminRole._id,
        status: "Active",
      });
    } else {
      testUser.password = testPasswordHash;
      await testUser.save();
    }

    const authRes = await authenticationEngine.login("IAM-TEST-01", "admin123", { ip: "192.168.1.1" });
    console.log("✅ IAM Authentication successful! User Code:", authRes.user.userCode, "Session ID:", authRes.session.sessionId);

      console.log("\n--- TEST 3: Token Rotation & Token Blacklisting ---");
      await tokenEngine.revokeToken(authRes.tokens.accessToken, authRes.user.userCode, "Logout Test");
      console.log("✅ Access token revoked & blacklisted successfully!");

      console.log("\n--- TEST 4: Session Manager & Force Revocation ---");
      const revSess = await sessionManager.revokeSession(authRes.session.sessionId);
      console.log("✅ Session revoked cleanly! Session Status:", revSess.status);

    console.log("\n--- TEST 5: Dynamic Identity Risk Engine ---");
    const risk = identityRiskEngine.calculateRisk({ isNewDevice: true, failedAttempts: 4 });
    console.log("✅ Dynamic Risk Score calculated:", risk.riskScore, "Risk Level:", risk.riskLevel);

    console.log("\n--- TEST 6: Authorization & ABAC Policy Engine ---", permissionRegistry.listPermissions().length);
    const authz = authorizationEngine.canAccess("Admin", "INVOICES_WRITE");
    console.log("✅ Authorization evaluation:", authz.isAllowed ? "ALLOWED" : "DENIED", "Reason:", authz.reason);

    console.log("\n--- TEST 7: Device Trust Inspector & API Key Studio ---");
    const dev = await deviceManager.registerDevice("ADM-0001", "Chrome Browser", "127.0.0.1");
    const trustedDev = await deviceManager.updateDeviceStatus(dev.deviceId, true, false);
    console.log("✅ Device trust updated! Device ID:", trustedDev.deviceId, "Is Trusted:", trustedDev.isTrusted);

    const apiKey = await apiKeyManager.createApiKey("Partner Integration Key", "ADM-0001", ["READ_ONLY"]);
    console.log("✅ API Key issued! Key ID:", apiKey.keyId, "Raw Key:", apiKey.rawKey.substr(0, 15) + "...");

    console.log("\n--- TEST 8: Identity Audit Logging & Event Bus Integration ---");
    const audit = await identityAudit.logEvent("USER_LOGIN", "ADM-0001", { action: "Verification Test" });
    console.log("✅ Identity Audit Logged! Audit ID:", audit.auditId);

    console.log("\n🎉 ALL 8 ENTERPRISE IDENTITY & ACCESS PLATFORM TESTS PASSED SUCCESSFULLY!");
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
