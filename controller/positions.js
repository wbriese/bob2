const hb = require('handlebars');
const fs=require('fs');
const angles=require('angles');
const fetch=require('node-fetch');
require('dotenv').config({path: __dirname + '/.env'});


function _addDateAndTime (el) {
  //let date=new Date(el.TIMESTAMP); //for data.json
  let date=new Date(el.utcDate);
  el.DATE=date.toLocaleDateString('en-GB');
  el.TIME=date.toLocaleTimeString('en-GB');
}

function _addRelWindHeading (el) {
  let course=parseInt(el.COURSE);
  let windAngle=parseInt(el.WIND_ANGLE);
  let diffAngle=angles.distance(course,windAngle);
  el.relWindHeading=diffAngle<90?diffAngle+"° (Wind ahead)":diffAngle+"° (Wind Astern)";
}

exports.positions = async function (ctx) {

  //console.log('Received get request',ctx.params);
  let shipID=ctx.request.query.shipID;
  const view=fs.readFileSync('reply.html','utf-8');
  console.log(process.env['API_TOKEN']);

  await fetch('http://api.routeguard.eu/RouteGuard/v1/ships/'+shipID+'/positions?MinimalData=false&Size=200',{
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      'Authorization': process.env['API_TOKEN'],
      'Content-Type': 'application/json'
    }})
    .then(response => response.json())
    .then(data => 
    
    {console.log(data);

      let mDataPoints=[...data.items];
      mDataPoints.forEach(_addDateAndTime); // add properties DATE and TIME from property TIMESTAMP 
      //mDataPoints.forEach(_addRelWindHeading); //add property relWindHeading to show wind direction compared to Heading
      mDataPoints.forEach(el=>el.SPEED_KNOTS=Math.floor(el.calculatedSpeedOverGround*100)/100); //correct Speed from 146 to 14,6kn
      const template=hb.compile(view); 
      ctx.body= template({positions:mDataPoints,shipID});
    });
 
 
};

