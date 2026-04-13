import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { paginationMeta } from '../validators/common.schemas.js';

function buildProductQuery(query) {
  const filter = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.category) {
    filter.category = query.category;
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  return filter;
}

export async function listProducts(request, response) {
  const { page, limit } = request.validated.query;
  const filter = buildProductQuery(request.validated.query);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  return response.json({
    data: items.map((product) => product.toPublicJSON()),
    meta: paginationMeta({ page, limit, total })
  });
}

export async function createProduct(request, response) {
  const product = await Product.create({
    ...request.validated.body,
    createdBy: request.user._id
  });

  return response.status(201).json({ data: product.toPublicJSON() });
}

export async function getProduct(request, response) {
  const product = await Product.findById(request.validated.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return response.json({ data: product.toPublicJSON() });
}

export async function replaceProduct(request, response) {
  const product = await Product.findOneAndReplace(
    { _id: request.validated.params.id },
    { ...request.validated.body, createdBy: request.user._id },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return response.json({ data: product.toPublicJSON() });
}

export async function updateProduct(request, response) {
  const product = await Product.findByIdAndUpdate(request.validated.params.id, request.validated.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return response.json({ data: product.toPublicJSON() });
}

export async function deleteProduct(request, response) {
  const product = await Product.findByIdAndDelete(request.validated.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return response.status(204).send();
}
