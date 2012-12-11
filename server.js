var amqp = require('amqp');
var bqutil = require('./formKeyMap.js');
var keys = require('./keys.js');
var columns = require('./columns.js');
var ckmap = require('./columnkeymapping.js');
var fs = require('./fsutil.js');
var du=require('./dateutil.js');
var fp= require('./fileproperties.js');
var cfg =require('./config.js');	
var ctypes = require('./columnstype.js').ctype;
var rbmqhost=cfg.config['RABBIT-HOST'];
//var queues =["MIS","MIS_API","LIS","LIS_API"];
var queues =cfg.config['QS'];
var logger = require('./logger.js').logger;
var filesuploader = require('./filesuploader/filesuploader.js');
var nomesslog = require('./logger.js').logger.loggers.get('nomess');
var messerror = require('./logger.js').logger.loggers.get('messerror');


var http = require("http");

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(8888);




/* for(var i=0;i<queues.length;i++){
  logger("trying to create new connection for "+"q: "+queues[i]);
 // var con=amqp.createConnection({ host: '10.120.10.33' });
//con.on('ready',function(){ logger.info("weeee")});
var con = cons[i];
	con.on('ready',(function(qname){
return function(){logger("con ready for q:"+qname);con.queue(qname,{autoDelete:false}, qOnReady);};
})(queues[i]));

}*/
/*amqp.createConnection({host:rbmqhost}).on('ready',function(){connection.queue("MIS",{autoDelete:false},qOnReady)});
amqp.createConnection({host:rbmqhost}).on('ready',function(){connection.queue("MIS_API",{autoDelete:false},qOnReady)});
amqp.createConnection({host:rbmqhost}).on('ready',function(){connection.queue("LIS",{autoDelete:false},qOnReady)});
amqp.createConnection({host:rbmqhost}).on('ready',function(){connection.queue("LIS_API",{autoDelete:false},qOnReady)});
*/


// Wait for connection to become established.
var connOn=false;
var qs = [];
var conOnReady= function () {
  connOn=true;
  nomesslog.info("connection ready");
  for(var i=0;i<queues.length;i++){
    q = connection.queue(queues[i],{autoDelete:false,closeChannelOnUnsubscribe: true}, qOnReady);
    qs[i]=q;
   }
}

var connection = null;
function launch(){
nomesslog.info("starting up");

connection = amqp.createConnection({ host: rbmqhost },{reconnect:false});
nomesslog.info("created connection ");
connection.on('ready',conOnReady);


connection.on('close',function(){ 
nomesslog.info('connection close called ');
connOn=false;
 /*for(var i =0;i<qs.length;i++){
  logger.info("going to unsubscribe "+qs[i].name);
  qs[i].unsubscribe(qs[i].name);
  /* qs[i].destroy().addCallback(function(){
                logger.info("q destroyed");
		connection.close();
	});
 }*/


});

connection.on('error',function(err){
nomesslog.info("connection errored out ");
logger.error(err);
 setTimeout(launch(),5000);
});



}



//connection.on('end',function(){ logger.info('connection end called')});




function qOnReady(q){
 // Catch all messages
  nomesslog.info("Q "+q.name+" is ready");
  q.bind('#');
 // Receive messages
  q.subscribe({cosumerTag:q.name},subscriber);
  fp.setFileStartTime(q.name,Date.now());
}
var count=0;
var tim=Date.now();
function subscriber(message,headers,deliveryinfo){
count++;
var msg = message.data.toString();


//fetch table mapping and schema from config

//apply transformation 
var bqfilepath=cfg.getFileName(deliveryinfo.queue);
//var s3filepath=cfg.config["BASE_DATA_PATH"]+deliveryinfo.queue+".map";
try{
      var val = bqutil.formBqCompliantLine(bqutil.formMapFromString(msg,keys.keys),columns.columns,ckmap.ckmap,ctypes)
      logger.info(val);

}catch(err){
  messerror.error(err);
}

fs.appendToFile(bqfilepath,val+"\n",errHandler);
//fs.appendToFile(s3filepath,msg+"\n",errHandler); // I dont think we need s3 file , we can transform from csv anyway
//and generate s3 and bigquery csv
//if we should rollover wait for all filewrites to end then rollover --for now we are blindly rolling over

    if((Date.now()-fp.getFileStartTime(deliveryinfo.queue))>cfg.config["FILE_ROLLOVER_TIME"]){
	logger.info("rolling over .................");
        var timestamp = du.getTimeStamp();
        fs.rollOverTheFileSync(bqfilepath,timestamp);
        //fs.rollOverTheFileSync(s3filepath,timestamp);
	fp.setFileStartTime(deliveryinfo.queue,Date.now());
	}
logger.info((Date.now()-tim)+" "+count);

}



function errHandler(err){
if(err) throw err;


}

 function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
  }

  


process.on( 'SIGINT', function() {
  nomesslog.info( "\n trying to gracefully shut down from  SIGINT (Crtl-C)" );
if(filesuploader.canWeShutdown()){
  nomesslog.info("no active bq importer is running");
  nomesslog.info("Attemting connection shutdown");
  connection.end();


	if(fs.allWritesDrained() && !connOn){
	nomesslog.info("Actually exiting "); 
	sleep(3000);
	process.exit();
	}else{
	nomesslog.info("Files are still being written we will wait or connection end is still not called");
	}

}else{ nomesslog.info("bq importer is still running , we will tell to schedule no further "); filesuploader.shutdown()};
});

launch();
filesuploader.startup();
//TODO 1. graceful exit test 2. Log file rotation and config 3.File rotation to be synchronized 4. proper config 5 .fs operations to be flushed before shutdown
//TODO seperate buckets for different teams


