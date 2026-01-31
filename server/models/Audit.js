import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    action: String,
    details: String,
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Audit", auditSchema);
