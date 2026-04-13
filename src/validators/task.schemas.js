import { z } from 'zod';
import { objectIdParamSchema, paginationQuerySchema } from './common.schemas.js';

const taskBody = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(''),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.coerce.date().optional()
});

export const createTaskSchema = z.object({
  body: taskBody
});

export const replaceTaskSchema = z.object({
  ...objectIdParamSchema.shape,
  body: taskBody
});

export const updateTaskSchema = z.object({
  ...objectIdParamSchema.shape,
  body: taskBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required'
  })
});

export const getTaskSchema = objectIdParamSchema;

export const listTasksSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional()
  })
});
