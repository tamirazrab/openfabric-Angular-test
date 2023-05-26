import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { productController, productValidation } from '../../modules/product';
import { auth } from '../../modules/auth';

const router: Router = express.Router();

router
  .route('/')
  .get(validate(productValidation.getProducts), productController.getProducts)
  .post(auth(), validate(productValidation.createProduct), productController.createProduct)

router
  .route('/:productId')
  .get(validate(productValidation.getProduct), productController.getProduct)
  .patch(auth(), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth(), validate(productValidation.deleteProduct), productController.deleteProduct);

export default router;
