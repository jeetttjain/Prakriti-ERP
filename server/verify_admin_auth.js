require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const authService = require("./src/services/auth.service");
const User = require("./src/models/User");
const Role = require("./src/models/Role");
const UserSession = require("./src/models/UserSession");
const bcrypt = require("bcrypt");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Admin Login with Default Seeded userCode (USR-0001) ---");
    const result1 = await authService.login("USR-0001", "admin", {
      ipAddress: "127.0.0.1",
      deviceInfo: "TestRunner",
    });
    console.log("✅ Default Admin login successful!");
    console.log("User returned:", {
      _id: result1.user._id,
      name: result1.user.name,
      userCode: result1.user.userCode,
      role: result1.user.role,
    });
    console.log("AccessToken generated:", !!result1.accessToken);
    console.log("RefreshToken generated:", !!result1.refreshToken);

    console.log("\n--- TEST 2: Check Session Created in DB ---");
    const session = await UserSession.findOne({ refreshToken: result1.refreshToken });
    if (session && session.isActive) {
      console.log("✅ UserSession created and active in DB for userId:", session.userId);
    } else {
      throw new Error("❌ Session creation failed or not found in DB.");
    }

    console.log("\n--- TEST 3: Login with Dynamic Custom userCode ---");
    const ownerRole = await Role.findOne({ roleName: "Owner" });
    const customUserCode = "DYN-ADMIN-777";
    
    // Clean up if previous test run created it
    await User.deleteOne({ userCode: customUserCode });

    const hashedPassword = await bcrypt.hash("customPass123", 10);
    const customUser = await User.create({
      userCode: customUserCode,
      name: "Dynamic Test Admin",
      email: "dynamic.admin@prakriti.com",
      mobile: "9998887770",
      password: hashedPassword,
      roleId: ownerRole._id,
      status: "Active",
    });

    const result3 = await authService.login(customUserCode, "customPass123", {
      ipAddress: "127.0.0.1",
      deviceInfo: "DynamicTest",
    });
    console.log("✅ Dynamic userCode login successful for:", result3.user.userCode);

    console.log("\n--- TEST 4: Legacy User Auto-Migration Test ---");
    // Create user without userCode
    const legacyEmail = "legacy.user@prakriti.com";
    await User.deleteOne({ email: legacyEmail });
    
    const legacyUser = new User({
      name: "Legacy User No Code",
      email: legacyEmail,
      mobile: "9990001112",
      password: hashedPassword,
      roleId: ownerRole._id,
      status: "Active",
    });
    // Explicitly bypass schema default if any or test missing field
    legacyUser.userCode = undefined;
    await legacyUser.save();

    console.log("Created legacy user without userCode, ID:", legacyUser._id);
    
    // Run migration check
    const usersWithoutCode = await User.find({
      $or: [{ userCode: { $exists: false } }, { userCode: null }, { userCode: "" }],
    });
    for (const u of usersWithoutCode) {
      let count = 2001;
      let newCode = `USR-${count}`;
      while (await User.findOne({ userCode: newCode })) {
        count++;
        newCode = `USR-${count}`;
      }
      await User.updateOne({ _id: u._id }, { $set: { userCode: newCode, roleId: ownerRole._id } });
      console.log(`🔄 Migrated user ${u._id} to userCode: ${newCode}`);
    }

    // Verify migrated user can login with assigned userCode
    const updatedLegacyUser = await User.findById(legacyUser._id);
    console.log("Migrated userCode is:", updatedLegacyUser.userCode);
    const legacyLoginResult = await authService.login(updatedLegacyUser.userCode, "customPass123");
    console.log("✅ Migrated user logged in successfully with assigned userCode:", legacyLoginResult.user.userCode);

    console.log("\n--- TEST 5: Attempt Login with Email (Should Fail) ---");
    try {
      await authService.login("admin@prakriti.com", "admin");
      console.error("❌ FAILED: Email login should not have succeeded!");
      process.exit(1);
    } catch (err) {
      console.log("✅ Email login correctly rejected with message:", err.message);
    }

    console.log("\n--- TEST 6: Attempt Login with Invalid Password ---");
    try {
      await authService.login("USR-0001", "wrongpass");
      console.error("❌ FAILED: Invalid password login should not have succeeded!");
      process.exit(1);
    } catch (err) {
      console.log("✅ Invalid password correctly rejected with message:", err.message);
    }

    // Cleanup test users
    await User.deleteOne({ _id: customUser._id });
    await User.deleteOne({ _id: legacyUser._id });

    console.log("\n🎉 ALL ENTERPRISE AUTHENTICATION TESTS PASSED SUCCESSFULLY!");
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
