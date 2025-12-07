import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  acronym: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.models.Department || mongoose.model('Department', departmentSchema);