const mongoose = require("mongoose");

const trainingProgramSchema = new mongoose.Schema(
  {
    trainingId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    durationHours: { type: Number, default: 8 },
    trainerName: { type: String, default: "Internal HR Trainer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingProgram", trainingProgramSchema);
