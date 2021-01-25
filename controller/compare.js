/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';
import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';

async function loadDataSets(ship) {
  let mDataPoints = await loadPositionData(ship);
  mDataPoints = transformPositions(mDataPoints);
  const avgUSDNM = mDataPoints.reduce((a, pos) => a + pos.USDNM, 0) / mDataPoints.length;
  // const avgfuelNM = mDataPoints.reduce((a, pos) => a + pos.fuelNM, 0) / mDataPoints.length;
  const neuralPropCurve = getNeuralNetPropCurve(getNeuralNetFunction(mDataPoints, ship));
  
  const shipAVG = Object.assign(ship, { avgUSDNM });
  return { ship: shipAVG, mDataPoints, neuralPropCurve };
}

export default async function compare(ctx) {
  const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));
  const template = hb.compile(fs.readFileSync('compare.html', 'utf-8'));
  const dataSets = await Promise.all(shipList.map(loadDataSets));
  const propCurve = getPropCurve(shipList[0]);
  ctx.body = template({ dataSets, propCurve });
}
