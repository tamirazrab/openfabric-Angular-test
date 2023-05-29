import mongoose from 'mongoose';
import { IProductDoc, IProductModel, ProductBrand, ProductCategory } from './product.interfaces';

import paginate from '../paginate/paginate';
import { toJSON } from '../toJSON';

const productSchema = new mongoose.Schema<IProductDoc, IProductModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 34,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 100,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ProductCategory,
      required: true,
    },
    brand: {
      type: String,
      enum: ProductBrand,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],                  // Array of strings for tags
      required: true,
      validate: {
        validator: function (tags: string[]) {
          return tags.length > 0;      // At least one tag is required
        },
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true,
  }
);


productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model<IProductDoc, IProductModel>('Product', productSchema);

export default Product;
