import hb from 'handlebars';
import fs from 'fs';
import fetch from 'node-fetch';
import transformPositions from './transformPositions.js';

const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));

function calcAVGSpeed(mDataPoints) {
  return Math.floor(mDataPoints.reduce(
    (acc, el) => (acc + el.calculatedSpeedOverGround), 0,
    // eslint-disable-next-line no-mixed-operators
  ) / mDataPoints.length * 100) / 100;
}

export default async function positions(ctx) {
  const { GOOGLE_MAP_KEY } = process.env;
  const { shipID } = ctx.request.query;
  const { ship } = shipList.find((el) => el.id === parseInt(shipID, 10));
  const view = fs.readFileSync('reply.html', 'utf-8');

  await fetch(`http://api.routeguard.eu/RouteGuard/v1/ships/${shipID}/positions?Size=360&positionTypes=0&Sources=2`, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${global.bearer}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // eslint-disable-next-line no-console
      const mDataPoints = transformPositions(data.items);
      const avgSpeed = calcAVGSpeed(mDataPoints);
      const template = hb.compile(view);
      ctx.body = template({
        positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList, avgSpeed,
      });
    });
}
