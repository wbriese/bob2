import Router from 'koa-router';
import positions from './controller/positions.js';

const router = new Router();

router.get('/ship', positions);

export default router;
