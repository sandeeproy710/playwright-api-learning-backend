import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  replaceProduct,
  updateProduct
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProductSchema,
  getProductSchema,
  listProductsSchema,
  replaceProductSchema,
  updateProductSchema
} from '../validators/product.schemas.js';

export const productRouter = Router();

productRouter.get('/', validate(listProductsSchema), asyncHandler(listProducts));
productRouter.post('/', requireAuth, validate(createProductSchema), asyncHandler(createProduct));
productRouter.get('/:id', validate(getProductSchema), asyncHandler(getProduct));
productRouter.put('/:id', requireAuth, validate(replaceProductSchema), asyncHandler(replaceProduct));
productRouter.patch('/:id', requireAuth, validate(updateProductSchema), asyncHandler(updateProduct));
productRouter.delete('/:id', requireAuth, validate(getProductSchema), asyncHandler(deleteProduct));
