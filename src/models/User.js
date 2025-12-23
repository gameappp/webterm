import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nickName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  deletedAt: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
