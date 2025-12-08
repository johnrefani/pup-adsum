// models/Course.ts
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  acronym: String,
  name: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
});

export default mongoose.models.Course || mongoose.model('Course', courseSchema);