/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';
// import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';
import { getRegressionFunction, getSeaTrialCurve, getRegressionPropCurve } from '../admiralRegression.js'
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';

function calcAVGSpeed(mDataPoints) {
  return Math.floor(mDataPoints.reduce(
    (acc, el) => (acc + el.calculatedSpeedOverGround), 0,
  ) / mDataPoints.length * 100) / 100;
}

export default async function showPositions(ctx) {
  const { GOOGLE_MAP_KEY } = process.env;
  const searchCriteria = ctx.request.query;
  let mDataPoints = await loadPositionData(searchCriteria);
  mDataPoints = transformPositions(mDataPoints);

  const ship = global.shipList.find((el) => el.id === Number.parseFloat(searchCriteria.shipID, 10));
  const shipType = global.shipTypes.find((el) => el.type === ship.type);
  
  // Add Neural Net ME consumption
  /* const neuralConsFunction = getNeuralNetFunction(mDataPoints, ship);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: neuralConsFunction(pos).toFixed(2) }));
  const neuralPropCurve = getNeuralNetPropCurve(neuralConsFunction); */
  // Add Admiralty Regression consumption
  const regressionFunction = getRegressionFunction(mDataPoints, shipType);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: regressionFunction(pos.AVGSpeed).toFixed(2) }));
  const neuralPropCurve = getRegressionPropCurve(regressionFunction);
  const propCurve = getSeaTrialCurve(shipType);
  const avgSpeed = calcAVGSpeed(mDataPoints);

  const view = fs.readFileSync('positions.html', 'utf-8');
  const template = hb.compile(view);
  ctx.body = template({
    positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList: global.shipList, avgSpeed, propCurve, neuralPropCurve, criteria:searchCriteria
  });
}
