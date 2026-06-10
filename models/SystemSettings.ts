import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  schoolYear: { type: String, required: true },
  semester: {
    type: String,
    enum: ['1st Semester', '2nd Semester'],
    required: true,
    default: '1st Semester',
  },
  yearLevelSnapshots: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

const SystemSettings =
  mongoose.models.SystemSettings ||
  mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
