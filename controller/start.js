/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';

export default async function start(ctx) {
  const view = fs.readFileSync('index.html', 'utf-8');
  const template = hb.compile(view);
  ctx.body = template({
    shipList: global.shipList, shipTypes: global.shipTypes,
  });
}
