var amqp=require('amqp');
var con = amqp.createConnection({ host: '10.120.10.33' });


con.on('ready',function(){
console.log("conn ready");
 for(;;){
console.log("publishing");
con.publish("BOSS","API_NAME:lis;APP_LOCAL_IP:10.120.202.22");
con.publish("MIS","API_NAME:mis;APP_LOCAL_IP:10.120.202.22");
//sleep(2000);
}

});



function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
  }




