/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';
import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';
import { getRegressionFunction, getRegressionPropCurve, getSeaTrialCurve } from '../admiralRegression.js';

async function loadDataSets(ship) {
  let mDataPoints = await loadPositionData({ shipID: ship.id });
  mDataPoints = transformPositions(mDataPoints, ship);
  // const avgfuelNM = mDataPoints.reduce((a, pos) => a + pos.fuelNM, 0) / mDataPoints.length;
  /* const neuralNetFunction = getNeuralNetFunction(mDataPoints, ship);
  const neuralPropCurve = getNeuralNetPropCurve(neuralNetFunction); */
  const shipType = global.shipTypes.find((el) => el.type === ship.type);
  const regressionFunction = getRegressionFunction(mDataPoints, shipType);
  const neuralPropCurve = getRegressionPropCurve(regressionFunction);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: regressionFunction(pos.AVGSpeed).toFixed(2) }));
  const avgUSDNM = mDataPoints.reduce((a, pos) => a + pos.USDNM, 0) / mDataPoints.length;
  const avgSlip = mDataPoints.reduce((a, pos) => a + pos.rpmSpeedRatio, 0) / mDataPoints.length;
  const shipAVG = Object.assign(ship, { avgUSDNM, avgSlip });
  //console.log(shipAVG);
  return { ship: shipAVG, mDataPoints, neuralPropCurve };
}

export default async function compare(ctx) {
  const { selectedShipType } = ctx.request.query;
  const shipType = global.shipTypes.find((el) => el.type === selectedShipType);
  const selectedShips = global.shipList.filter((el) => el.type === selectedShipType);
  const template = hb.compile(fs.readFileSync('compare.html', 'utf-8'));
  const dataSets = await Promise.all(selectedShips.map(loadDataSets));
  const propCurve = getSeaTrialCurve(shipType);
  ctx.body = template({ dataSets, propCurve, selectedShipType });
}
