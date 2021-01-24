import fetch from 'node-fetch';
import _ from 'lodash';

// Filter to check incoming position data from Rest API
function filterBeforeTransform(el) {
  return !_.isEmpty(el.weather)
  && !Number.isNaN(Number(el.calculatedCourse))
  && !Number.isNaN(Number(el.weather.swellHeight))
  && (!Number.isNaN(Number(el.weather.swellDirection)) || Number.parseFloat(el.weather.swellHeight, 10) === 0)
  && !Number.isNaN(Number(el.weather.fF10)) // Wind Force
  && (!Number.isNaN(Number(el.weather.dD10)) || Number.parseFloat(el.weather.fF10 === 0)) // Wind direction
  && Number.parseFloat(el.weather.swellHeight, 10) <= 4
  && Number.parseFloat(el.weather.fF10, 10) < 30
  && !Number.isNaN(Number(el.rpm))
  && el.bunkerConsumerValues[0] 
  && !Number.isNaN(Number(el.bunkerConsumerValues[0].val)) // ME cons
  && el.bunkerConsumerValues[1] 
  && !Number.isNaN(Number(el.bunkerConsumerValues[1].val)) // AE cons
  && el.additionalValues.find((item) => item.id === 7)
  && !Number.isNaN(Number(el.additionalValues.find((item) => item.id === 7).val)) // distance
  && el.additionalValues.find((item) => item.id === 1)
  && !Number.isNaN(Number(el.additionalValues.find((item) => item.id === 1).val)) // draftAft
  && el.additionalValues.find((item) => item.id === 2)
  && !Number.isNaN(Number(el.additionalValues.find((item) => item.id === 2).val)) // draft Fwd
  && el.additionalValues.find((item) => item.id === 45).val
  && !Number.isNaN(Number(el.additionalValues.find((item) => item.id === 45).val)) // distToGo
  && el.additionalValues.find((item) => item.id === 55).val
  && !Number.isNaN(Number(el.additionalValues.find((item) => item.id === 55).val)) // AVG Speed
  && el.additionalValues.find((item) => item.id === 25); // nextPort
}

export default async function loadPositionData(ship) {
  const data = await fetch(`http://api.routeguard.eu/RouteGuard/v1/ships/${ship.id}/positions?positionTypes=0&Sources=2`, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${global.bearer}`,
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  let mDataPoints = data.items;
  mDataPoints = mDataPoints.filter(filterBeforeTransform);
  return mDataPoints;
}
