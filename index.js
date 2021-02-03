import dotenv from 'dotenv';
import Koa from 'koa';
import koaStatic from 'koa-static';
import fs from 'fs';
import router from './router.js';
import getBearer from './getBearer.js';

global.shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));
global.shipTypes = JSON.parse(fs.readFileSync('./controller/shipTypes.json', 'utf-8'));

const app = new Koa();
dotenv.config();

const { PORT } = process.env;

app.use(koaStatic('./node_modules/'));
app.use(getBearer);
app.use(router.routes());

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // eslint-disable-line no-console
});
