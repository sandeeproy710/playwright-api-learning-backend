import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  replaceTask,
  updateTask
} from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createTaskSchema,
  getTaskSchema,
  listTasksSchema,
  replaceTaskSchema,
  updateTaskSchema
} from '../validators/task.schemas.js';

export const taskRouter = Router();

taskRouter.get('/', requireAuth, validate(listTasksSchema), asyncHandler(listTasks));
taskRouter.post('/', requireAuth, validate(createTaskSchema), asyncHandler(createTask));
taskRouter.get('/:id', requireAuth, validate(getTaskSchema), asyncHandler(getTask));
taskRouter.put('/:id', requireAuth, validate(replaceTaskSchema), asyncHandler(replaceTask));
taskRouter.patch('/:id', requireAuth, validate(updateTaskSchema), asyncHandler(updateTask));
taskRouter.delete('/:id', requireAuth, validate(getTaskSchema), asyncHandler(deleteTask));
