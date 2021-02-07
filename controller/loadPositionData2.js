import fetch from 'node-fetch';
import _ from 'lodash';

// Filter to check incoming position data from Rest API
function basicFilter(el) {
  return !_.isEmpty(el.weather)
  && !Number.isNaN(Number(el.calculatedCourse))
  && !Number.isNaN(Number(el.weather.swellHeight))
  && (!Number.isNaN(Number(el.weather.swellDirection)) || Number.parseFloat(el.weather.swellHeight, 10) === 0)
  && !Number.isNaN(Number(el.weather.fF10)) // Wind Force
  && (!Number.isNaN(Number(el.weather.dD10)) || Number.parseFloat(el.weather.fF10 === 0)) // Wind direction
  && !Number.isNaN(Number(el.weather.seaTemperature))
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

export default async function loadPositionData(criteria) {
  console.log(criteria);
  if (Number.isNaN(+criteria.shipID)) criteria.shipID = 10878;
  if (Number.isNaN(+criteria.size)) criteria.size = 365;
  if (Number.isNaN(+criteria.dist)) criteria.dist = 200;
  if (Number.isNaN(+criteria.maxWind)) criteria.maxWind = 20;
  if (Number.isNaN(+criteria.maxSwell)) criteria.maxSwell = 2;
  
  const data = await fetch(`http://api.routeguard.eu/RouteGuard/v1/ships/${criteria.shipID}/positions?Size=${criteria.size}&positionTypes=0&Sources=2`, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${global.bearer}`,
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  let mDataPoints = data.items;
  mDataPoints = mDataPoints.filter(basicFilter);
  mDataPoints = mDataPoints.filter((el) =>
    Number.parseFloat(el.weather.swellHeight, 10) <= Number.parseFloat(criteria.maxSwell)
    && Number.parseFloat(el.weather.fF10, 10) <= Number.parseFloat(criteria.maxWind)
    && Number.parseFloat(el.additionalValues.find((item) => item.id === 7).val) > Number.parseFloat(criteria.dist));
  return mDataPoints;
}
