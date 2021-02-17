/* eslint-disable max-len */
import hb from 'handlebars';
import fs from 'fs';
// import { getNeuralNetFunction, getNeuralNetPropCurve, getPropCurve } from './createNeural.js';
import { getRegressionFunction, getSeaTrialCurve, getRegressionPropCurve } from '../admiralRegression.js'
import loadPositionData from './loadPositionData.js';
import transformPositions from './transformPositions.js';


export default async function showPositions(ctx) {
  const { GOOGLE_MAP_KEY } = process.env;
  let searchCriteria = ctx.request.query;
      searchCriteria.maxWind=50;
      searchCriteria.maxSwell=10;
      searchCriteria.dist=1;

  let mDataPoints = await loadPositionData(searchCriteria);
  mDataPoints = transformPositions(mDataPoints);

  const ship = global.shipList.find((el) => el.id === Number.parseFloat(searchCriteria.shipID, 10));
  const shipType = global.shipTypes.find((el) => el.type === ship.type);
  const view = fs.readFileSync('daily.html', 'utf-8');
  const template = hb.compile(view);
  ctx.body = template({
    positions: mDataPoints, ship, GOOGLE_MAP_KEY, shipList: global.shipList,  criteria:searchCriteria
  });
}
