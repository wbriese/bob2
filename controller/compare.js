/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';
import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';
import {getRegressionFunction, getAdmiralPropCurve, getSeaTrialCurve } from '../admiralRegression.js';

async function loadDataSets(ship) {
  let mDataPoints = await loadPositionData({ shipID: ship.id });
  mDataPoints = transformPositions(mDataPoints);
  // const avgfuelNM = mDataPoints.reduce((a, pos) => a + pos.fuelNM, 0) / mDataPoints.length;
  /* const neuralNetFunction = getNeuralNetFunction(mDataPoints, ship);
  const neuralPropCurve = getNeuralNetPropCurve(neuralNetFunction); */

  const regressionFunction = getRegressionFunction(mDataPoints);
  const neuralPropCurve = getAdmiralPropCurve(regressionFunction);
  mDataPoints = mDataPoints.map((pos) => Object.assign(pos, { neuralCons: regressionFunction(pos.AVGSpeed).toFixed(2) }));
  
  const avgUSDNM = mDataPoints.reduce((a, pos) => a + pos.USDNM, 0) / mDataPoints.length;
  const shipAVG = Object.assign(ship, { avgUSDNM });
  return { ship: shipAVG, mDataPoints, neuralPropCurve };
}

export default async function compare(ctx) {
  const shipList = JSON.parse(fs.readFileSync('./controller/shipList.json', 'utf-8'));
  const template = hb.compile(fs.readFileSync('compare.html', 'utf-8'));
  const dataSets = await Promise.all(shipList.map(loadDataSets));
  const propCurve = getSeaTrialCurve(shipList[0]);
  ctx.body = template({ dataSets, propCurve });
}
