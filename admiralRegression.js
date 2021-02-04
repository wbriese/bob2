/* eslint-disable max-len */
import regression from 'regression';

function getPropellerCurveFunction(speedConsPairs) {
  //console.log(speedConsPairs);
  const propCurveFunction = regression.polynomial(speedConsPairs, { order: 3 });
  //console.log(propCurveFunction.string);
  //console.log(propCurveFunction.r2);
  return (speed) => propCurveFunction.predict(speed)[1] * 0.180 * 24 / 1000;
}

export function getRegressionFunction(mDataPoints, shipType) {
  const propellerCurveFunction = getPropellerCurveFunction(shipType.speedConsPairs);
  const addDraftCorrectedConsumption = (position) => Object.assign(position,
    { MEconsDraftCorrected: position.MEcons * (shipType.displacement / (shipType.displacement + (position.draftAft + position.draftFwd - shipType.draftAft - shipType.draftFwd) * 0.5 * shipType.tpc * 100)) ** 0.6667 });
 
  let dataPoints = mDataPoints.map(addDraftCorrectedConsumption);
  dataPoints.forEach(el=>console.log('MEcons', el.MEcons, ' MEcons corrected', el.MEconsDraftCorrected));

  dataPoints = mDataPoints.map((el) => [el.AVGSpeed, el.MEconsDraftCorrected / propellerCurveFunction(el.AVGSpeed)]);
  const regressionFunction = regression.polynomial(dataPoints, { order: 0 });
  //console.log(regressionFunction.string);
  //console.log(regressionFunction.r2);
  return (speed) => regressionFunction.predict(speed)[1] * propellerCurveFunction(speed);
}

export function getRegressionPropCurve(regressionFunction) {
  const propCurve = [];
  for (let speed = 12; speed < 16.6; speed += 0.2) {
    const cons = regressionFunction(speed);
    propCurve.push({ speed: speed.toFixed(2), cons: cons.toFixed(2) });
  }
  return propCurve;
}

export function getSeaTrialCurve(shipType) {
  const propellerCurveFunction = getPropellerCurveFunction(shipType.speedConsPairs);
  const propCurve = [];
  for (let speed = 12; speed < 16.6; speed += 0.2) {
    const cons = propellerCurveFunction(speed);
    propCurve.push({ speed: speed.toFixed(2), cons: cons.toFixed(2) });
  }
  return propCurve;
}
