import { Router } from 'express';
import { listUsers } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import { paginationQuerySchema } from '../validators/common.schemas.js';

export const userRouter = Router();

const listUsersSchema = z.object({
  query: paginationQuerySchema
});

userRouter.get('/', requireAuth, validate(listUsersSchema), asyncHandler(listUsers));
