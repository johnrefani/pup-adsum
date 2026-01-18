// models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idNumber: {
    type: String,
    required: function(this: any) { return this.role === 'member'; },
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'main'],
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: function(this: any) { return this.role === 'member'; },
  },
  yearLevel: {
    type: String,
    enum: ['1', '2', '3', '4'],
    required: function(this: any) { return this.role === 'member'; },
  },
  profilePicture: { type: String, default: null },
}, { timestamps: true });

userSchema.index({ idNumber: 1 }, { unique: true, sparse: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;