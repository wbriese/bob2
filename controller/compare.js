import hb from 'handlebars';
import fs from 'fs';
import fetch from 'node-fetch';
import transformPositions from './transformPositions.js';

async function loadPositionData(ship) {
  const data = await fetch(`http://api.routeguard.eu/RouteGuard/v1/ships/${ship.id}/positions?Size=120&positionTypes=0&Sources=2`, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${global.bearer}`,
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  const mDataPoints = transformPositions(data.items);
  ship.avgUSDNM = mDataPoints.reduce((a, pos) => a + pos.USDNM, 0) / mDataPoints.length;
  return { ship, mDataPoints };
}

export default async function compare(ctx) {
  const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));
  const template = hb.compile(fs.readFileSync('positions.html', 'utf-8'));

  const dataSets = await Promise.all(shipList.map(loadPositionData));
  //console.log(dataSets.forEach((i) => console.log(i.mDataPoints)));
  ctx.body = template({ dataSets });
}
