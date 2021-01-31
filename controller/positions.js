import hb from 'handlebars';
import fs from 'fs';
// import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';
import { getRegressionFunction, getSeaTrialCurve, getAdmiralPropCurve } from '../admiralRegression.js'
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
  const { shipID, maxSwell, maxWind, size } = ctx.request.query;
  const ship = shipList.find((el) => el.id === Number.parseFloat(shipID, 10));
  const criteria = { shipID, maxSwell, maxWind, size };
  let mDataPoints = await loadPositionData(criteria);
  mDataPoints = transformPositions(mDataPoints);

  // Add Neural Net ME consumption
  /* const neuralConsFunction = getNeuralNetFunction(mDataPoints, ship);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: neuralConsFunction(pos).toFixed(2) }));
  const neuralPropCurve = getNeuralNetPropCurve(neuralConsFunction); */
  // Add Admiralty Regression consumption
  const regressionFunction = getRegressionFunction(mDataPoints);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: regressionFunction(pos.AVGSpeed).toFixed(2) }));
  const neuralPropCurve = getAdmiralPropCurve(regressionFunction);
  const propCurve = getSeaTrialCurve(regressionFunction);
  const avgSpeed = calcAVGSpeed(mDataPoints);

  const view = fs.readFileSync('positions.html', 'utf-8');
  const template = hb.compile(view);
  ctx.body = template({
    positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList, avgSpeed, propCurve, neuralPropCurve, criteria
  });
}
