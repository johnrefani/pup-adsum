// models/Attendance.ts
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeIn: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['present', 'absent', null], 
    default: null 
  }
}, {
  timestamps: true
});

attendanceSchema.index({ session: 1, member: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);