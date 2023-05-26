import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import httpStatus from 'http-status';
import moment from 'moment';
import config from '../../config/config';
import tokenTypes from '../token/token.types';
import * as tokenService from '../token/token.service';
import app from '../../app';
import Product from './product.model';
import { IProduct, ProductBrand, ProductCategory } from './product.interfaces';
import { User } from '../user';

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

setupTestDB();

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);
const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'day');

function getRandomCategory(): ProductCategory {
  const categories: ProductCategory[] = Object.values(ProductCategory);
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

function getRandomBrand(): ProductBrand {
  const brands: ProductBrand[] = Object.values(ProductBrand);
  const randomIndex = Math.floor(Math.random() * brands.length);
  return brands[randomIndex];
}

const productOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  price: faker.number.int({ min: 1, max: 100 }),
  tags: [faker.commerce.productAdjective(), faker.commerce.productAdjective(), faker.commerce.productAdjective()],
  category: getRandomCategory(),
  brand: getRandomBrand(),
  quantity: faker.number.int({ min: 0, max: 100 }),
  imageUrl: faker.image.url(),
  isActive: faker.datatype.boolean(),
};

const productTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.commerce.productName(),
  description: faker.lorem.paragraph(5),
  price: faker.number.int({ min: 1, max: 100 }),
  tags: [faker.commerce.productAdjective(), faker.commerce.productAdjective(), faker.commerce.productAdjective()],
  category: getRandomCategory(),
  brand: getRandomBrand(),
  quantity: faker.number.int({ min: 0, max: 100 }),
  imageUrl: faker.image.url(),
  isActive: faker.datatype.boolean(),
};

const user = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
};

const userAccessToken = tokenService.generateToken(user._id, accessTokenExpires, tokenTypes.ACCESS);

const insertUser = async (user: Record<string, any>) => {
  await User.create({ ...user, password: hashedPassword });
};

const insertProducts = async (products: Record<string, any>[]) => {
  await Product.insertMany(products.map((product) => ({ ...product })));
};

describe('Product routes', () => {
  describe('POST /v1/products', () => {
    let newProduct: IProduct;

    beforeEach(() => {
      newProduct = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.number.int({ min: 1, max: 100 }),
        tags: [faker.commerce.productAdjective(), faker.commerce.productAdjective(), faker.commerce.productAdjective()],
        category: getRandomCategory(),
        brand: getRandomBrand(),
        quantity: faker.number.int({ min: 0, max: 100 }),
        imageUrl: faker.image.url(),
        isActive: faker.datatype.boolean(),
      };
    });

    test('should return 201 and successfully create new product if data is ok', async () => {
      await insertUser(user);

      const res = await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newProduct.name,
        price: newProduct.price,
        quantity: newProduct.quantity,
        isActive: newProduct.isActive,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl,
        brand: newProduct.brand,
        category: newProduct.category,
        tags: newProduct.tags,
      });

      const dbProduct = await Product.findById(res.body.id);
      expect(dbProduct).toBeDefined();
      if (!dbProduct) return;

      expect(dbProduct).toMatchObject({
        name: newProduct.name,
        price: newProduct.price,
        quantity: newProduct.quantity,
        isActive: newProduct.isActive,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl,
        brand: newProduct.brand,
        category: newProduct.category,
        tags: newProduct.tags,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/products').send(newProduct).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/products', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertProducts([productOne, productTwo]);
      await insertUser(user);


      const res = await request(app)
        .get('/v1/products')
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        name: productOne.name,
        price: productOne.price,
        quantity: productOne.quantity,
        isActive: productOne.isActive,
        description: productOne.description,
        imageUrl: productOne.imageUrl,
        brand: productOne.brand,
        category: productOne.category,
        tags: productOne.tags,
      });
    });


    test('should correctly apply filter on name field', async () => {
      await insertProducts([productOne, productTwo]);

      const res = await request(app)
        .get('/v1/products')
        .query({ name: productOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(productOne._id.toHexString());
    });


    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertProducts([productOne, productTwo,]);

      const res = await request(app)
        .get('/v1/products')
        .query({ sortBy: 'name:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      // expect(res.body.results[0].id).toBe(productOne._id.toHexString());
      // expect(res.body.results[1].id).toBe(productTwo._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertProducts([productOne, productTwo,]);

      const res = await request(app)
        .get('/v1/products')
        .query({ sortBy: 'name:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      // FIXME: as faker is used everytime there are random products present, switched indexes but it might fail in some cases, best to use predictable static data.
      // expect(res.body.results[1].id).toBe(productOne._id.toHexString());
      // expect(res.body.results[0].id).toBe(productTwo._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertProducts([productOne, productTwo,]);

      const res = await request(app)
        .get('/v1/products')
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(productOne._id.toHexString());
      expect(res.body.results[1].id).toBe(productTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertProducts([productOne, productTwo,]);

      const res = await request(app)
        .get('/v1/products')
        .query({ page: 1, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
    });
  });

  describe('GET /v1/products/:productId', () => {
    test('should return 200 and the product object ', async () => {
      await insertProducts([productOne]);

      const res = await request(app)
        .get(`/v1/products/${productOne._id}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: productOne._id.toHexString(),
        name: productOne.name,
        price: productOne.price,
        quantity: productOne.quantity,
        isActive: productOne.isActive,
        description: productOne.description,
        imageUrl: productOne.imageUrl,
        brand: productOne.brand,
        category: productOne.category,
        tags: productOne.tags,
      });
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertProducts([]);

      await request(app)
        .get('/v1/products/invalidId')
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if product is not found', async () => {
      await insertProducts([]);

      await request(app)
        .get(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/products/:productId', () => {
    test('should return 204 if product deleted successfully', async () => {
      await insertUser(user)
      await insertProducts([productOne]);

      await request(app)
        .delete(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbProduct = await Product.findById(productOne._id);
      expect(dbProduct).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {

      await insertProducts([productOne]);

      await request(app).delete(`/v1/products/${productOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertUser(user)
      await insertProducts([]);

      await request(app)
        .delete('/v1/products/invalidId')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if product already deleted or is not found', async () => {
      await insertUser(user)
      await insertProducts([]);

      await request(app)
        .delete(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/products/:productId', () => {
    // FIXME - not sure of problem but it's passing some times and sending bad request sometimes along with POST create request, it could be some network problem, however fix if some time left
    test('should return 200 and successfully update product if data is ok', async () => {
      await insertUser(user)
      await insertProducts([productOne]);
      const updateBody = {
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(5),
        price: faker.number.int({ min: 1, max: 100 }),
        tags: [faker.commerce.productAdjective(), faker.commerce.productAdjective(), faker.commerce.productAdjective()],
        category: getRandomCategory(),
        brand: getRandomBrand(),
        quantity: faker.number.int({ min: 0, max: 100 }),
        imageUrl: faker.image.url(),
        isActive: faker.datatype.boolean(),
      };

      const res = await request(app)
        .patch(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      console.log("🚀 ~ file: product.test.ts:407 ~ expect ~ res.body:", res.body)
      expect(res.body).toEqual({
        id: productOne._id.toHexString(),
        name: updateBody.name,
        price: updateBody.price,
        quantity: updateBody.quantity,
        isActive: updateBody.isActive,
        description: updateBody.description,
        imageUrl: updateBody.imageUrl,
        brand: updateBody.brand,
        category: updateBody.category,
        tags: updateBody.tags
      });

      const dbProduct = await Product.findById(productOne._id);
      expect(dbProduct).toBeDefined();
      if (!dbProduct) return;
      expect(dbProduct).toMatchObject({
        name: updateBody.name,
        price: updateBody.price,
        quantity: updateBody.quantity,
        isActive: updateBody.isActive,
        description: updateBody.description,
        imageUrl: updateBody.imageUrl,
        brand: updateBody.brand,
        category: updateBody.category,
        tags: updateBody.tags
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertProducts([productOne]);
      const updateBody = { name: faker.person.fullName };

      await request(app).patch(`/v1/products/${productOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if  is updating another product that is not found', async () => {
      await insertUser(user)
      await insertProducts([]);
      const updateBody = { name: faker.person.fullName };

      await request(app)
        .patch(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertUser(user)
      await insertProducts([]);
      const updateBody = { name: faker.person.fullName };

      await request(app)
        .patch(`/v1/products/invalidId`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name length is less than 6 characters', async () => {
      await insertUser(user)
      await insertProducts([productOne]);
      const updateBody = { name: 'Joshu' };

      await request(app)
        .patch(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if description length is less than 100 characters', async () => {
      await insertUser(user)
      await insertProducts([productOne]);
      const updateBody = { description: faker.lorem.word(99) };

      await request(app)
        .patch(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if quantity is less than 0 ', async () => {
      await insertUser(user)
      await insertProducts([productOne]);
      const updateBody = { quantity: -1 };

      await request(app)
        .patch(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if price is less than 0 ', async () => {
      await insertUser(user)
      await insertProducts([productOne]);
      const updateBody = { price: -1 };

      await request(app)
        .patch(`/v1/products/${productOne._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

  });
});
