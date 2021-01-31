import regression from 'regression';

function getPropellerCurveFunction() {
  const propCurve = [
    [0, 0],
    [15, 3820],
    [16, 4930],
    [17, 6684],
    [17.5, 7549],
    [18, 8363],
    [18.5, 9372],
    [19, 10493],
  ];
  const propCurveFunction = regression.polynomial(propCurve, { order: 3 });
  return (speed) => propCurveFunction.predict(speed)[1] * 0.180 * 24 / 1000;
}

export function getRegressionFunction(mDataPoints) {
  const propellerCurveFunction = getPropellerCurveFunction();
  //console.log(propellerCurveFunction(16));
  const dataPoints = mDataPoints.map((el) => [el.AVGSpeed, el.MEcons / propellerCurveFunction(el.AVGSpeed)]);
  //console.log(dataPoints);
  const regressionFunction = regression.polynomial(dataPoints, { order: 0 });
  //console.log(regressionFunction.string);
  //console.log(regressionFunction.r2);
  return (speed) => regressionFunction.predict(speed)[1] * propellerCurveFunction(speed);
}

export function getAdmiralPropCurve(regressionFunction) {
  const propCurve = [];
  for (let speed = 12; speed < 16.5; speed += 0.2) {
    const cons = regressionFunction(speed);
    propCurve.push({ speed, cons });
  }
  return propCurve;
}

export function getSeaTrialCurve() {
  const propellerCurveFunction = getPropellerCurveFunction();
  const propCurve = [];
  for (let speed = 12; speed < 16.5; speed += 0.2) {
    const cons = propellerCurveFunction(speed);
    propCurve.push({ speed, cons });
  }
  return propCurve;
}
