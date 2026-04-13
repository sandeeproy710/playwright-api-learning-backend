import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

productSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description,
    price: this.price,
    stock: this.stock,
    category: this.category,
    tags: this.tags,
    isActive: this.isActive,
    createdBy: this.createdBy?.toString(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const Product = mongoose.model('Product', productSchema);
