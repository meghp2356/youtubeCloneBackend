import mongoose from "mongoose";

const subcrpitionSchema = mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const subscriber = mongoose.model('Subcrpition',subcrpitionSchema);
