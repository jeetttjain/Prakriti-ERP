const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: {
      type: Map,
      of: new mongoose.Schema(
        {
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          export: { type: Boolean, default: false },
          approve: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: {},
    },
    isSystemRole: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
