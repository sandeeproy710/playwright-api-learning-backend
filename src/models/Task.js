import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

taskSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    status: this.status,
    priority: this.priority,
    dueDate: this.dueDate,
    owner: this.owner?.toString(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const Task = mongoose.model('Task', taskSchema);
