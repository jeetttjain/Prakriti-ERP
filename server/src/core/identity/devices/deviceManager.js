const mongoose = require("mongoose");
const IdentityDevice = require("../../../models/IdentityDevice");

class DeviceManager {
  /**
   * Registers or updates a device record.
   */
  async registerDevice(userCode, deviceName = "Browser", ipAddress = "127.0.0.1") {
    const deviceId = `DEV-${Date.now()}`;
    let dev = await IdentityDevice.findOne({ userCode, deviceName });
    if (!dev) {
      dev = await IdentityDevice.create({
        deviceId,
        userCode,
        deviceName,
        ipAddress,
        isTrusted: false,
        isBlocked: false,
        riskScore: 15,
      });
    } else {
      dev.lastLoginAt = new Date();
      dev.ipAddress = ipAddress;
      await dev.save();
    }
    return dev;
  }

  /**
   * Trust or Block device.
   */
  async updateDeviceStatus(deviceId, isTrusted, isBlocked) {
    const query = mongoose.Types.ObjectId.isValid(deviceId)
      ? { $or: [{ _id: deviceId }, { deviceId }] }
      : { deviceId };
    const dev = await IdentityDevice.findOne(query);
    if (!dev) throw new Error("Device record not found.");

    if (typeof isTrusted === "boolean") dev.isTrusted = isTrusted;
    if (typeof isBlocked === "boolean") dev.isBlocked = isBlocked;
    await dev.save();

    return dev;
  }
}

module.exports = new DeviceManager();
