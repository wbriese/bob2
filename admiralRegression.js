/* eslint-disable max-len */
import regression from 'regression';

function getPropellerCurveFunction(speedConsPairs) {
  console.log(speedConsPairs);
  const propCurveFunction = regression.polynomial(speedConsPairs, { order: 3 });
  console.log(propCurveFunction.string);
  console.log(propCurveFunction.r2);
  return (speed) => propCurveFunction.predict(speed)[1] * 0.180 * 24 / 1000;
}

export function getRegressionFunction(mDataPoints, shipType) {
  console.log(shipType);
  const propellerCurveFunction = getPropellerCurveFunction(shipType.speedConsPairs);
  //console.log(propellerCurveFunction(16));
  const dataPoints = mDataPoints.map((el) => [el.AVGSpeed, el.MEcons / propellerCurveFunction(el.AVGSpeed)]);
  //console.log(dataPoints);
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
