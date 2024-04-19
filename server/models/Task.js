import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  content: { type: String, required: true },
  status: { type: String, required: true, enum: ['Backlog', 'ToDo', 'InProgress', 'Done'] },
  position: { type: Number, required: true }
});

const Task = mongoose.model('Task', taskSchema, 'Task');

export default Task;

