import dotenv from 'dotenv';
import Koa from 'koa';
import koaStatic from 'koa-static';
import router from './router.js';
import getBearer from './getBearer.js';

const app = new Koa();
dotenv.config();

const { PORT } = process.env;

app.use(getBearer);
app.use(koaStatic('./'));
app.use(router.routes());

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // eslint-disable-line no-console
});
