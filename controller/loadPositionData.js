import fetch from 'node-fetch';

// Filter to check incoming position data from Rest API
function basicFilter(el) {
  return !Number.isNaN(+el.speed)
  && !Number.isNaN(+el.course)
  && !Number.isNaN(+el.swellHeight)
  && (!Number.isNaN(+el.swellDirection) || Number(el.swellHeight) === 0) // Swell Direction or no Swell
  && !Number.isNaN(+el.windSpeedKts) // Wind Force
  && (!Number.isNaN(+el.windDirection) || Number(el.windSpeedKts) === 0) //Wind Direction or no Wind
  && !Number.isNaN(+el.rpm)
  && !Number.isNaN(+el.bunkerHFOLSMainEngine) // ME cons
  && !Number.isNaN(+el.bunkerHFOLSAuxiliaryEngines)// AE cons
  && !Number.isNaN(+el.draftAft)
  && !Number.isNaN(+el.draftFwd)
  && !Number.isNaN(+el.milesToGo)
  && !Number.isNaN(+el.avgObsSpeed)
  && el.destination
  && Number(el.steamingTime) === 24;
  
}


export default async function loadPositionData(criteria) {
  //console.log(criteria);
  if (Number.isNaN(+criteria.shipID)) criteria.shipID = 10878;
  if (Number.isNaN(+criteria.size)) criteria.size = 365;
  if (Number.isNaN(+criteria.dist)) criteria.dist = 200;
  if (Number.isNaN(+criteria.maxWind)) criteria.maxWind = 20;
  if (Number.isNaN(+criteria.maxSwell)) criteria.maxSwell = 2;
  //console.log(criteria.dateFrom);
  const dateFrom = criteria.dateFrom ? new Date(criteria.dateFrom).toISOString():
  new Date(+Date.now() - criteria.size * 86400000).toISOString();
  const dateTo = criteria.dateTo ? new Date(criteria.dateTo).toISOString():
  new Date(Date.now()).toISOString();
  
  console.log(`http://api.routeguard.eu/RouteGuard/v1/reports/analysis/segments?ShipId=${criteria.shipID}&DateFrom=${dateFrom}&DateTo=${dateTo}`);

  const data = await fetch(`http://api.routeguard.eu/RouteGuard/v1/reports/analysis/segments?ShipId=${criteria.shipID}&DateFrom=${dateFrom}&DateTo=${dateTo}`, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${global.bearer}`,
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  let mDataPoints = data.items;
  //console.log("Before Filter", mDataPoints.length);
  mDataPoints = mDataPoints.filter(basicFilter);
  //console.log("After Filter", mDataPoints.length);

  /* mDataPoints.forEach(element => {
  console.log(JSON.stringify(element));
  }); */
 /*  mDataPoints = mDataPoints.filter((el) =>
    Number.parseFloat(el.swellHeight, 10) <= Number.parseFloat(criteria.maxSwell)
    && Number.parseFloat(el.windSpeedKts, 10) <= Number.parseFloat(criteria.maxWind)
    && Number.parseFloat(el.observedDistance) > Number.parseFloat(criteria.dist));
     */
  return mDataPoints;
}
