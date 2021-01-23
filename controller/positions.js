import hb from 'handlebars';
import fs from 'fs';
import fetch from 'node-fetch';
import transformPositions from './transformPositions.js';
import getNeuralNetFunction from './createNeural.js';

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
  const ship = shipList.find((el) => el.id === parseInt(shipID, 10));
  const view = fs.readFileSync('positions.html', 'utf-8');

  await fetch(`http://api.routeguard.eu/RouteGuard/v1/ships/${shipID}/positions?Size=300&positionTypes=0&Sources=2`, {
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
      let mDataPoints = data.items;
      mDataPoints = transformPositions(data.items);
      mDataPoints = mDataPoints.filter((el) => el.additionalValues.find((item) => item.id === 7) && el.calculatedCourse && el.weather.swellHeight <= 4 && el.weather.fF10 < 30 && parseInt(el.dist) > 200);
      const neuralConsFunction = getNeuralNetFunction(mDataPoints, ship);
      mDataPoints = mDataPoints.map((pos) => ({ ...pos, neuralCons: Math.floor(10*neuralConsFunction(pos))/10 }));

      //  console.log ('mDataPoints', mDataPoints);
      const avgSpeed = calcAVGSpeed(mDataPoints);
      const template = hb.compile(view);
      ctx.body = template({
        positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList, avgSpeed,
      });
    });
}
