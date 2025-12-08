
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  qrToken: { type: String, required: true, unique: true },
  qrImageUrl: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);