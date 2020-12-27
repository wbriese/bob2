const hb = require('handlebars');
const fs=require('fs');
const angles=require('angles');
const fetch=require('node-fetch');
const shipList=require('./shipList.json');



function _addDateAndTime (el) {
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

  
  let shipID=ctx.request.query.shipID;
  let ship=shipList.find(el=>el.id==shipID).ship;
  const view=fs.readFileSync('reply.html','utf-8');
  console.log(process.env['API_TOKEN']);

  await fetch('http://api.routeguard.eu/RouteGuard/v1/ships/'+shipID+'/positions?Size=250&positionTypes=0',{
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      'Authorization': "Bearer "+process.env['API_TOKEN'],
      'Content-Type': 'application/json'
    }})
    .then(response => response.json())
    .then(data => 
    
    {console.log(data);

      let mDataPoints=[...data.items];
      mDataPoints.forEach(_addDateAndTime); // add properties DATE and TIME from property TIMESTAMP 
      //mDataPoints.forEach(_addRelWindHeading); //add property relWindHeading to show wind direction compared to Heading
      mDataPoints=mDataPoints.filter(el=>el.calculatedSpeedOverGround>10&&el.calculatedSpeedOverGround<20);
      mDataPoints.forEach(el=>el.SPEED_KNOTS=Math.floor(el.calculatedSpeedOverGround*100)/100); 
      let avgSpeed=~~(mDataPoints.reduce((acc,el)=>(acc+el.calculatedSpeedOverGround),0)/mDataPoints.length*100)/100;
      const template=hb.compile(view); 
      ctx.body= template({positions:mDataPoints,ship,GOOGLE_MAP_KEY:process.env.GOOGLE_MAP_KEY,shipList,avgSpeed});
    });
 
 
};

