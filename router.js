import Router from 'koa-router';
import positions from './controller/positions.js';
import compare from './controller/compare.js';
import start from './controller/start.js';
import daily from './controller/daily.js';

const router = new Router();

router.get('/', start);
router.get('/ship', positions);
router.get('/compare', compare);
router.get('/daily', daily);

export default router;
