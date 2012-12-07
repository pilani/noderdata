var amqp=require('amqp');
var con = amqp.createConnection({ host: 'quota1.boss.travel' });


con.on('ready',function(){
console.log("conn ready");
 for(var i=0;i<100;i++){
console.log("publishing");
con.publish("LIS","API_NAME:lis;APP_LOCAL_IP:10.120.202.22");
con.publish("MIS","API_NAME:mis;APP_LOCAL_IP:10.120.202.22");
sleep(2000);
}

});



function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
  }




