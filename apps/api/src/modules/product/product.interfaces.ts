import { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export const ProductCategory = ["Electronics", "Clothing", "Home", "Books", "Beauty"] as const;
export type ProductCategory = typeof ProductCategory[number];

export const ProductBrand = ["Apple", "Nike", "IKEA", "L'Oreal"] as const;
export type ProductBrand = typeof ProductBrand[number];

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand: ProductBrand;
  tags: string[];
  quantity: number;
  imageUrl: string;
  isActive: boolean;
}

export interface IProductDoc extends IProduct, Document {
}

export interface IProductModel extends Model<IProductDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}


export type UpdateProductBody = Partial<IProduct>;
