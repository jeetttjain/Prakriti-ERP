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
    const adminEmail = "admin@prakriti.com";
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        userCode: "USR-0001",
        name: "Prakriti Owner",
        email: adminEmail,
        mobile: "9876543210",
        password: hashedPassword,
        roleId: ownerRole._id,
        status: "Active",
        mustChangePassword: false,
      });
      console.log(`🌱 Seeded default user account: ${adminEmail} (password: admin).`);
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