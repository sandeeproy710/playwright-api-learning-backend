import { z } from 'zod';

const email = z.string().trim().email().max(120);
const password = z.string().min(6).max(100);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    password,
    role: z.enum(['student', 'admin']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password
  })
});
