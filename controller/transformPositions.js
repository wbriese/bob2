/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
import angles from 'angles';

function addDateAndTime(el) {
  const date = new Date(el.utcDate);
  return { ...el, DATE: date.toLocaleDateString('en-GB'), TIME: date.toLocaleTimeString('en-GB') };
}

function addRelWindHeading(el) {
  const course = Number.parseFloat(+el.calculatedCourse.toFixed(2), 10);
  const windAngle = Number.isNaN(el.weather.swellDirection) ? Number.parseFloat(el.weather.dD10, 10) : 0;
  const diffAngle = Math.round(angles.distance(course, windAngle));
  const projectedWindForce = Math.floor(Number.parseFloat(el.weather.fF10, 10) * Math.cos(angles.toRad(diffAngle)) * 10);
  if (Number.isNaN(projectedWindForce)) console.log("Fehler Wind!!",el);
  const relWindHeading = diffAngle < 90 ? `${diffAngle}° (ahead)` : `${diffAngle}° (astern)`;
  return { ...el, relWindHeading, projectedWindForce };
}

function addRelSwellHeading(el) {
  const course = Number.parseFloat(+el.calculatedCourse.toFixed(2), 10);
  const swellAngle = Number.isNaN(el.weather.swellDirection) ? Number.parseFloat(el.weather.swellDirection, 10) : 0;
  const diffAngle = Math.round(angles.distance(course, swellAngle));
  const relSwellHeading = diffAngle < 90 ? `${diffAngle}° (ahead)` : `${diffAngle}° (astern)`;
  const projectedSwellForce = Math.floor(Number.parseFloat(el.weather.swellHeight, 10) * Math.cos(angles.toRad(diffAngle)) * 100);
  if (Number.isNaN(projectedSwellForce)) console.log("Fehler !! Swell:",el);
  return { ...el, relSwellHeading, projectedSwellForce };
}

function addProperties(el) {
  const SPEED_KNOTS = Number.parseFloat(el.calculatedSpeedOverGround.toFixed(2));
  const COURSE = Number.parseInt(el.calculatedCourse, 10);
  const MEcons = Number.parseFloat(el.bunkerConsumerValues[0].val, 10);
  const AEcons = Number.parseFloat(el.bunkerConsumerValues[1].val, 10);
  const dist = Number.parseFloat(el.additionalValues.find((item) => item.id === 7).val, 10);
  const draftAft = Number.parseFloat(el.additionalValues.find((item) => item.id === 1).val, 10);
  const draftFwd = Number.parseFloat(el.additionalValues.find((item) => item.id === 2).val, 10);
  const nextPort = el.additionalValues.find((item) => item.id === 25).val;
  const distToGo = Number.parseFloat(el.additionalValues.find((item) => item.id === 45).val, 10);
  const AVGSpeed = Number.parseFloat(el.additionalValues.find((item) => item.id === 55).val, 10);
  const fuelNM = dist ? Math.floor(10 * ((MEcons + AEcons) * 1000 / (dist))) / 10 : 0;
  const USDNM = dist ? Math.floor(10 * (fuelNM * 300 / 1000 + 12000 / (AVGSpeed * 24))) / 10 : 0;
  const MEconsAvgSpeed = dist ? Math.floor(10 * (MEcons + AEcons) / dist * AVGSpeed * 24) / 10 : 0;
  const seaTemperature = parseFloat(el.weather.seaTemperature);
  return {
    ...el, SPEED_KNOTS, COURSE, MEcons, AEcons, dist, draftAft, draftFwd, nextPort, distToGo, seaTemperature, AVGSpeed, fuelNM, USDNM, MEconsAvgSpeed,
  };
}

export default function transformPositions(positions) {
  let mDataPoints = [...positions];
  mDataPoints = mDataPoints.map(addDateAndTime);
  mDataPoints = mDataPoints.map(addRelWindHeading);
  mDataPoints = mDataPoints.map(addRelSwellHeading);
  mDataPoints = mDataPoints.map(addProperties);
  return mDataPoints;
}
