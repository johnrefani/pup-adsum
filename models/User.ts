// models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'member'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  yearLevel: { type: String, enum: ['1', '2', '3', '4'] },
  profilePicture: String,
});

export default mongoose.models.User || mongoose.model('User', userSchema);