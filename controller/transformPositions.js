/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
import angles from 'angles';

function addDateAndTime(el) {
  const date = new Date(el.utcDate);
  return { ...el, DATE: date.toLocaleDateString('en-GB'), TIME: date.toLocaleTimeString('en-GB') };
}

function addRelWindHeading(el) {
  const course = parseInt(el.calculatedCourse, 10);
  const windAngle = parseInt(el.weather.dD10, 10);
  const diffAngle = angles.distance(course, windAngle);
  const projectedWindForce = Math.floor(el.weather.fF10 * Math.cos(angles.toRad(diffAngle)) * 100) / 50;
  const relWindHeading = diffAngle < 90 ? `${diffAngle}° (ahead)` : `${diffAngle}° (astern)`;
  return { ...el, relWindHeading, projectedWindForce };
}

function addRelSwellHeading(el) {
  const course = parseInt(el.calculatedCourse, 10);
  const swellAngle = parseInt(el.weather.swellDirection, 10);
  const diffAngle = angles.distance(course, swellAngle);
  const relSwellHeading = diffAngle < 90 ? `${diffAngle}° (ahead)` : `${diffAngle}° (astern)`;
  const projectedSwellForce = Math.floor(el.weather.swellHeight * Math.cos(angles.toRad(diffAngle)) * 100) / 20;
  return { ...el, relSwellHeading, projectedSwellForce };
}

function addProperties(el) {
  const SPEED_KNOTS = Math.floor(el.calculatedSpeedOverGround * 100) / 100;
  const COURSE = Math.floor(el.calculatedCourse);
  const MEcons = el.bunkerConsumerValues[0] ? el.bunkerConsumerValues[0].val : 0;
  const AEcons = el.bunkerConsumerValues[1] ? el.bunkerConsumerValues[1].val : 0;
  const dist = el.additionalValues.find((item) => item.id === 7) ? el.additionalValues.find((item) => item.id === 7).val : 0;
  const draftAft = el.additionalValues.find((item) => item.id === 1) ? el.additionalValues.find((item) => item.id === 1).val : 0;
  const draftFwd = el.additionalValues.find((item) => item.id === 2) ? el.additionalValues.find((item) => item.id === 2).val : 0;
  const nextPort = el.additionalValues.find((item) => item.id === 25) ? el.additionalValues.find((item) => item.id === 25).val : 0;
  const distToGo = el.additionalValues.find((item) => item.id === 45) ? el.additionalValues.find((item) => item.id === 45).val : 0;
  const AVGSpeed = el.additionalValues.find((item) => item.id === 55) ? el.additionalValues.find((item) => item.id === 55).val : 0;
  const fuelNM = dist ? Math.floor(10 * ((MEcons + AEcons) * 1000 / (dist))) / 10 : 0;
  const USDNM = dist ? Math.floor(10 * (fuelNM * 300 / 1000 + 12000 / (AVGSpeed * 24))) / 10 : 0;
  const MEconsAvgSpeed = dist ? Math.floor(10 * (MEcons + AEcons) / dist * AVGSpeed * 24) / 10 : 0;
  return {
    ...el, SPEED_KNOTS, COURSE, MEcons, AEcons, dist, draftAft, draftFwd, nextPort, distToGo, AVGSpeed, fuelNM, USDNM, MEconsAvgSpeed,
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

/* {{#each this.mDataPoints}}
                   {t: new Date("{{this.DATE}}").valueOf(), y: {{this.USDNM}} },
                {{/each}} */
