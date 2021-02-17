/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
import angles from 'angles';

function addDateAndTime(el) {
  const date = new Date(el.dateUtc);
  return { ...el, DATE: date.toLocaleDateString('en-GB'), TIME: date.toLocaleTimeString('en-GB') };
}

function addRelWindHeading(el) {
  const windAngle = !Number.isNaN(el.windSpeedKts) ? Number.parseFloat(el.windDirection, 10) : 0;
  const diffAngle = Math.round(angles.distance(+el.course, windAngle));
  const projectedWindForce = el.windSpeedKts * Math.cos(angles.toRad(diffAngle))  ;
  if (Number.isNaN(projectedWindForce)) console.log("Fehler Wind!!",el);
  const relWindHeading = diffAngle < 90 ? `${diffAngle}° (ahead)` : `${diffAngle}° (astern)`;
  return { ...el, relWindHeading, projectedWindForce: projectedWindForce.toFixed(2) };
}

function addRelSwellHeading(el) {
  const swellAngle = !Number.isNaN(el.swellDirection) ? Number.parseFloat(el.swellDirection, 10) : 0;
  const diffAngle = Math.round(angles.distance(+el.course, swellAngle));
  const relSwellHeading = diffAngle < 90 ? `${diffAngle}° (ahead)` : `${diffAngle}° (astern)`;
  const projectedSwellForce = el.swellHeight * Math.cos(angles.toRad(diffAngle));
  if (Number.isNaN(projectedSwellForce)) console.log("Fehler !! Swell:",el);
  return { ...el, relSwellHeading, projectedSwellForce: projectedSwellForce.toFixed(2) };
}

function addSpeedWater(el) {
  const speed = +el.speed;
  const currentAngle = !Number.isNaN(el.currentSpeed) ? Number.parseFloat(el.currentDirection, 10) : 0;
  const diffAngle = Math.round(angles.distance(+el.course, currentAngle));
  const relCurrentHeading = diffAngle < 90 ? `${diffAngle}° (astern)` : `${diffAngle}° (ahead)`;
  const currentDifX = +el.currentSpeed * Math.cos(angles.toRad(diffAngle));
  const currentDifY = +el.currentSpeed * Math.sin(angles.toRad(diffAngle));
  const speedWater = Math.sqrt((speed - currentDifX) ** 2 + currentDifY ** 2);
  if (Number.isNaN(currentDifX) || Number.isNaN(currentDifY)) console.log("Fehler !! speedWater:",el);
  el.currentSpeed = el.currentSpeed.toFixed(2);
  return { ...el, speedWater: speedWater.toFixed(2), relCurrentHeading };
}

function addProperties(el) {
  const SPEED_KNOTS = Number.parseFloat(el.speed.toFixed(2));
  const COURSE = Number.parseInt(el.course, 10);
  const MEcons = Number.parseFloat(el.bunkerHFOLSMainEngine, 10);
  const AEcons = Number.parseFloat(el.bunkerHFOLSAuxiliaryEngines, 10);
  const dist = Number.parseFloat(el.observedDistance, 10);
  const draftAft = Number.parseFloat(el.draftAft, 10);
  const draftFwd = Number.parseFloat(el.draftFwd, 10);
  const nextPort = el.destination;
  const distToGo = Number.parseFloat(el.milesToGo, 10);
  const AVGSpeed = Number.parseFloat(el.avgObsSpeed, 10);
  const fuelNM = (MEcons + AEcons) * 1000 / dist ;
  //const MEconsAvgSpeed = dist ? Math.floor(10 * (MEcons + AEcons) / dist * AVGSpeed * 24) / 10 : 0;
  const rpmSpeedRatio = el.rpm / el.speedWater;
  return {
    ...el, SPEED_KNOTS, rpmSpeedRatio: rpmSpeedRatio.toFixed(2), COURSE, MEcons, AEcons, dist, draftAft, draftFwd, nextPort, distToGo, AVGSpeed, fuelNM: fuelNM.toFixed(2), 
  };
}

function addUSDNM(el) {
  //console.log(el.shipId);
  const ship = global.shipList.find((item) => Number(item.id) === el.shipId);
  //console.log('Ship ', ship);
  const shipType = global.shipTypes.find((item) => item.type === ship.type);
  //console.log('Ship Type', shipType);
  const USDNM = +el.fuelNM * global.fuelPrice / 1000 + shipType.TCRate / (el.AVGSpeed * 24);
  //console.log('USDNM', USDNM);
  return { ...el, USDNM: USDNM.toFixed(2) };
}

export default function transformPositions(positions) {
  let mDataPoints = [...positions];
  mDataPoints = mDataPoints.map(addDateAndTime);
  mDataPoints = mDataPoints.map(addRelWindHeading);
  mDataPoints = mDataPoints.map(addSpeedWater);
  mDataPoints = mDataPoints.map(addRelSwellHeading);
  mDataPoints = mDataPoints.map(addProperties);
  mDataPoints = mDataPoints.map(addUSDNM);
  return mDataPoints;
}
