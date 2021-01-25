import hb from 'handlebars';
import fs from 'fs';
import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';

const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));

function calcAVGSpeed(mDataPoints) {
  return Math.floor(mDataPoints.reduce(
    (acc, el) => (acc + el.calculatedSpeedOverGround), 0,
  ) / mDataPoints.length * 100) / 100;
}

export default async function showPositions(ctx) {
  const { GOOGLE_MAP_KEY } = process.env;
  const { shipID } = ctx.request.query;
  const ship = shipList.find((el) => el.id === Number.parseFloat(shipID, 10));
  const view = fs.readFileSync('positions.html', 'utf-8');

  let mDataPoints = await loadPositionData(ship);
  mDataPoints = transformPositions(mDataPoints);

  // Add Neural Net ME consumption
  const neuralConsFunction = getNeuralNetFunction(mDataPoints, ship);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: neuralConsFunction(pos).toFixed(2) }));
  console.log(mDataPoints);
  const propCurve = getPropCurve(ship);
  const neuralPropCurve = getNeuralNetPropCurve(neuralConsFunction);
  const avgSpeed = calcAVGSpeed(mDataPoints);
  const template = hb.compile(view);
  ctx.body = template({
    positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList, avgSpeed, propCurve, neuralPropCurve
  });
}
