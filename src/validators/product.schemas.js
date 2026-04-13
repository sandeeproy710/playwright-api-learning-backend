import { z } from 'zod';
import { objectIdParamSchema, paginationQuerySchema } from './common.schemas.js';

const queryBoolean = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

const productBody = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1).max(1000),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  category: z.string().trim().min(2).max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  isActive: z.boolean().default(true)
});

export const createProductSchema = z.object({
  body: productBody
});

export const replaceProductSchema = z.object({
  ...objectIdParamSchema.shape,
  body: productBody
});

export const updateProductSchema = z.object({
  ...objectIdParamSchema.shape,
  body: productBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required'
  })
});

export const getProductSchema = objectIdParamSchema;

export const listProductsSchema = z.object({
  query: paginationQuerySchema.extend({
    category: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isActive: queryBoolean.optional()
  })
});
