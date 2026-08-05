const mongoose = require("mongoose");

const seedDB = async () => {
  try {
    const Role = require("../models/Role");
    const User = require("../models/User");
    const bcrypt = require("bcrypt");

    // Seed Owner Role
    let ownerRole = await Role.findOne({ roleName: "Owner" });
    if (!ownerRole) {
      ownerRole = await Role.create({
        roleName: "Owner",
        description: "Administrator owner with full privileges.",
        isSystemRole: true,
        permissions: {},
      });
      console.log("🌱 Seeded default Owner role.");
    }

    // Seed default admin user
    const adminUser = await User.findOne({ $or: [{ userCode: "USR-0001" }, { email: "admin@prakriti.com" }] });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        userCode: "USR-0001",
        name: "Prakriti Owner",
        email: "admin@prakriti.com",
        mobile: "9876543210",
        password: hashedPassword,
        roleId: ownerRole._id,
        status: "Active",
        mustChangePassword: false,
      });
      console.log(`🌱 Seeded default user account: USR-0001 (password: admin).`);
    }

    // Automatic migration for existing users missing userCode
    const usersWithoutCode = await User.find({
      $or: [{ userCode: { $exists: false } }, { userCode: null }, { userCode: "" }],
    });
    if (usersWithoutCode.length > 0) {
      let count = 1001;
      for (const u of usersWithoutCode) {
        let newCode = `USR-${count}`;
        while (await User.findOne({ userCode: newCode })) {
          count++;
          newCode = `USR-${count}`;
        }
        await User.updateOne({ _id: u._id }, { $set: { userCode: newCode, ...(u.roleId ? {} : { roleId: ownerRole._id }) } });
        console.log(`🔄 Migrated existing user ${u._id} (${u.name}) to userCode: ${newCode}`);
        count++;
      }
    }
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully");
    await seedDB();
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;