'use strict';

const Router = require('koa-router');
const router = new Router();
const positions=require('./controller/positions');

router.get('/ship',positions.positions);

module.exports = router;


