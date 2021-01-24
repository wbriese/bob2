import hb from 'handlebars';
import fs from 'fs';
import getNeuralNetFunction from './createNeural.js';
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';

const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));

function calcAVGSpeed(mDataPoints) {
  return Math.floor(mDataPoints.reduce(
    (acc, el) => (acc + el.calculatedSpeedOverGround), 0,
  ) / mDataPoints.length * 100) / 100;
}

function getPropCurve(ship) {
  const propCurve = [];
  for (let speed = 12; speed < 16; speed += 0.2) {
    // eslint-disable-next-line max-len
    const cons = ship.propPolynom[0] + ship.propPolynom[1] * speed + ship.propPolynom[2] * speed ** 2 + ship.propPolynom[3] * speed ** 3;
    propCurve.push({ speed, cons });
  }
  return propCurve;
}

function getNeuralNetPropCurve(ship, mDataPoints) {
  const neuralPropCurve = [];
  const neuralConsFunction = getNeuralNetFunction(mDataPoints, ship);
  for (let speed = 12; speed < 16; speed += 0.2) {
    neuralPropCurve.push({
      speed,
      cons: neuralConsFunction({
        draftAft: 5.8,
        draftFwd: 5.2,
        projectedWindForce: 0,
        projectedSwellForce: 0,
        AVGSpeed: speed,
        rpm: 90 * speed / 12,
      })
    });
  }
  return neuralPropCurve;
}

export default async function showPositions(ctx) {
  const { GOOGLE_MAP_KEY } = process.env;
  const { shipID } = ctx.request.query;
  const ship = shipList.find((el) => el.id === Number.parseFloat(shipID, 10));
  const view = fs.readFileSync('positions.html', 'utf-8');

  let mDataPoints = await loadPositionData(ship);
  mDataPoints = transformPositions(mDataPoints);

  const propCurve = getPropCurve(ship);
  const neuralPropCurve = getNeuralNetPropCurve(ship, mDataPoints);
  const avgSpeed = calcAVGSpeed(mDataPoints);
  const template = hb.compile(view);
  ctx.body = template({
    positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList, avgSpeed, propCurve, neuralPropCurve
  });
}
