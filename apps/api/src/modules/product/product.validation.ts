import Joi from 'joi';
import { password, objectId } from '../validate/custom.validation';
import { IProduct, ProductBrand, ProductCategory } from './product.interfaces';

const createProductBody: Record<keyof IProduct, any> = {
  name: Joi.string().trim().required().max(20),
  description: Joi.string().trim().required().max(500),
  price: Joi.number().required().min(0),
  category: Joi.string().valid(...ProductCategory).required(),
  brand: Joi.string().valid(...ProductBrand).required(),
  quantity: Joi.number().default(0).min(0),
  imageUrl: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
  isActive: Joi.boolean().default(true),
};

const updateProductBody: Partial<Record<keyof IProduct, any>> = {
  name: Joi.string().trim().max(20),
  description: Joi.string().trim().max(500),
  price: Joi.number().min(0),
  category: Joi.string().valid(...ProductCategory),
  brand: Joi.string().valid(...ProductBrand),
  quantity: Joi.number().default(0).min(0),
  imageUrl: Joi.string(),
  isActive: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string())
};

export const createProduct = {
  body: Joi.object().keys(createProductBody),
};

export const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

export const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys(updateProductBody)
    .min(1),
};

export const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};
