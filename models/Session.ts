// models/Session.ts
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: {
    type: String,
    enum: ['1st Semester', '2nd Semester'],
    default: '1st Semester',
  },
  schoolYear: { type: String, default: '' },
  gracePeriodMinutes: { type: Number, min: 0, default: 15 },
  absentAfterMinutes: { type: Number, min: 0, default: 30 },
  startTimeOutBeforeEndMinutes: { type: Number, min: 0, default: 0 },
  timeOutLimitMinutes: { type: Number, min: 0, default: 30 },
  qrToken: { type: String, required: true, unique: true },
  qrImageUrl: { type: String },
  venueLocation: {
    lat: Number,
    lng: Number,
  },
  allowedRadiusMeters: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;
