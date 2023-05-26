import express, { Router } from 'express';
import authRoute from './auth.route';
import productRoute from './product.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
];


defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});


export default router;
