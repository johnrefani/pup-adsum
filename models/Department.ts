// models/Department.ts
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  acronym: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

export default Department;