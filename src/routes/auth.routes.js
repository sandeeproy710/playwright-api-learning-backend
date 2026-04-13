import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../validators/auth.schemas.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(register));
authRouter.post('/login', validate(loginSchema), asyncHandler(login));
authRouter.get('/me', requireAuth, asyncHandler(me));
