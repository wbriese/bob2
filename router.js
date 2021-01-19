import Router from 'koa-router';
import positions from './controller/positions.js';
import compare from './controller/compare.js';

const router = new Router();

router.get('/ship', positions);
router.get('/compare', compare);

export default router;
