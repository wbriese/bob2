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
  let course=parseInt(el.calculatedCourse);
  let windAngle=parseInt(el.weather.dD10);
  let diffAngle=angles.distance(course,windAngle);
  el.relWindHeading=diffAngle<90?diffAngle+"° (ahead)":diffAngle+"° (astern)";
}

function _addRelSwellHeading (el) {
  let course=parseInt(el.calculatedCourse);
  let swellAngle=parseInt(el.weather.swellDirection);
  let diffAngle=angles.distance(course,swellAngle);
  el.relSwellHeading=diffAngle<90?diffAngle+"° (ahead)":diffAngle+"° (astern)";
}

exports.positions = async function (ctx) {

  
  let shipID=ctx.request.query.shipID;
  let ship=shipList.find(el=>el.id==shipID).ship;
  const view=fs.readFileSync('reply.html','utf-8');
  console.log(process.env['API_TOKEN']);

  await fetch('http://api.routeguard.eu/RouteGuard/v1/ships/'+shipID+'/positions?Size=60&positionTypes=0&Sources=2',{
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
      mDataPoints=mDataPoints.filter(el=>el.additionalValues.find(item=>item.id==7)&&el.calculatedCourse);
      mDataPoints.forEach(_addDateAndTime); // add properties DATE and TIME from property TIMESTAMP 
      mDataPoints.forEach(_addRelWindHeading); //add property relWindHeading to show wind direction compared to Heading
      mDataPoints.forEach(_addRelSwellHeading); //add property relWindHeading to show wind direction compared to Heading
      mDataPoints.forEach(el=>
        {
          el.SPEED_KNOTS=Math.floor(el.calculatedSpeedOverGround*100)/100; 
          el.COURSE=Math.floor(el.calculatedCourse); 
          el.ME_cons=el.bunkerConsumerValues[0]?el.bunkerConsumerValues[0].val:0; 
          el.AE_cons=el.bunkerConsumerValues[1]?el.bunkerConsumerValues[1].val:0;
          el.dist=el.additionalValues.find(item=>item.id==7)?el.additionalValues.find(item=>item.id==7).val:0;
          el.draftAft=el.additionalValues.find(item=>item.id==1)?el.additionalValues.find(item=>item.id==1).val:0;
          el.draftFwd=el.additionalValues.find(item=>item.id==2)?el.additionalValues.find(item=>item.id==2).val:0;
          el.nextPort=el.additionalValues.find(item=>item.id==25)?el.additionalValues.find(item=>item.id==25).val:0;
          el.distToGo=el.additionalValues.find(item=>item.id==45)?el.additionalValues.find(item=>item.id==45).val:0;
          el.AVGSpeed=el.additionalValues.find(item=>item.id==55)?el.additionalValues.find(item=>item.id==55).val:0;
          el.fuelNM=el.dist?Math.floor(10*(el.ME_cons*1000/(el.dist)))/10:0;
          el.USDNM=el.dist?Math.floor(10*(el.fuelNM*300/1000+12000/(el.AVGSpeed*24)))/10:0;
        });

     
      let avgSpeed=Math.floor(mDataPoints.reduce((acc,el)=>(acc+el.calculatedSpeedOverGround),0)/mDataPoints.length*100)/100;
      const template=hb.compile(view); 
      ctx.body= template({positions:mDataPoints,ship,GOOGLE_MAP_KEY:process.env.GOOGLE_MAP_KEY,shipList,avgSpeed});
    });
 
 
};

