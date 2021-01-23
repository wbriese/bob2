/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';
import fetch from 'node-fetch';
import transformPositions from './transformPositions.js';

async function loadPositionData(ship) {
  const data = await fetch(`http://api.routeguard.eu/RouteGuard/v1/ships/${ship.id}/positions?positionTypes=0&Sources=2`, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${global.bearer}`,
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  let mDataPoints = data.items;
  mDataPoints = transformPositions(data.items);

  // Apply filters to this position Data
  mDataPoints = mDataPoints.filter((el) => el.additionalValues.find((item) => item.id === 7) && el.calculatedCourse && el.weather.swellHeight <= 2 && el.weather.fF10 < 20 && parseInt(el.dist) > 200);
  mDataPoints = mDataPoints.filter((el) => (el.USDNM < 70 && el.USDNM > 45));
  
  ship.avgUSDNM = mDataPoints.reduce((a, pos) => a + pos.USDNM, 0) / mDataPoints.length;
  //ship.avgfuelNM = mDataPoints.reduce((a, pos) => a + pos.fuelNM, 0) / mDataPoints.length;
  return { ship, mDataPoints };
}

export default async function compare(ctx) {
  const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));
  const template = hb.compile(fs.readFileSync('compare.html', 'utf-8'));

  const dataSets = await Promise.all(shipList.map(loadPositionData));
  //console.log(dataSets.forEach((i) => console.log(i.mDataPoints)));
  ctx.body = template({ dataSets });
}
