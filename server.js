var amqp = require('amqp');
var bqutil = require('./formKeyMap.js');
var keys = require('./keys.js');
var columns = require('./columns.js');
var ckmap = require('./columnkeymapping.js');
var fs = require('./fsutil.js');
//start(3000,'127.0.0.1');
var fp= require('./fileproperties.js');
var cfg =require('./config.js');	
var ctypes = require('./columnstype.js').ctype;
var rbmqhost=cfg.config['RABBIT-HOST'];
//var queues =["MIS","MIS_API","LIS","LIS_API"];
var queues =cfg.config['QS'];
var logger = require('./logger.js').logger;
var filesuploader = require('./filesuploader/filesuploader.js');
var messlog = require('./logger.js').logger.loggers.get('mess');
var messerror = require('./logger.js').logger.loggers.get('messerror');
var filelogger = require('./logger.js').logger.loggers.get('fileuploader');
var httpport = cfg.config['HTTP-PORT'];
//var http = require('http');
var express = require('express'),
   routes = require('./routes')
  , stylus = require('stylus');
obj = require('./bqImportsHealthCheck/bqjobstatus'); 
pendingFilesObj = require('./bqImportsHealthCheck/bqPendingFiles.js'); 
failedFilesObj = require('./bqImportsHealthCheck/bqFailedFiles.js');
rtd  = require('./rtd/realTimeData.js');
var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  
  app.use(stylus.middleware(
		  {
			src: __dirname + '/views',
	  		dest: __dirname + '/public'
		  }));  

  app.use(express.static(__dirname + '/public'));
});


// Routes
app.get('/', function (req, res) {
  res.render('index',
  { title : 'index' , body: '...'}
  )
})
app.get('/bqhome', routes.bqhome);
app.get('/impff', routes.impff);
app.get('/rmqhcs', routes.rmqhcs);
app.get('/bqPendingFiles', pendingFilesObj.bqGetListOfPendingFiles);
app.get('/bqFailedFiles', failedFilesObj.bqGetListOfFailedFiles);
app.get('/bqImportsHealthCheckService', obj.bqImportsHealthCheckService);

app.listen(httpport);

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
  logger.info("connection ready");
  for(var i=0;i<queues.length;i++){
    q = connection.queue(queues[i],{autoDelete:false,closeChannelOnUnsubscribe: true}, qOnReady);
    qs[i]=q;
   }
}

var connection = null;
function launch(){
loggerm("starting up");

connection = amqp.createConnection({ host: rbmqhost },{reconnect:false});
logger.info("created connection ");
connection.on('ready',conOnReady);


filelogger.info(" filesuploader stated : "+new Date());
filesuploader.startup();

connection.on('close',function(){ 
loggerm('connection close called ');
connOn=false;

});

connection.on('error',function(err){
logger.info("connection errored out "+err);
//console.log("connection errored out );
logger.error(err);
 setTimeout(launch,5000);
});



}

function qOnReady(q){
 // Catch all messages
  logger.info("Q "+q.name+" is ready");
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
     var kvmap = bqutil.formMapFromStringV2(msg,keys.keys);
     var val = bqutil.formBqCompliantLine(kvmap,columns.columns,ckmap.ckmap,ctypes)
     messlog.info(val);
     fs.appendToFile(bqfilepath,val+"\n",errHandler);
     rtd.log2RealTimeDataStore(kvmap);

}catch(err){
  messerror.error("error in parsing "+err.stack);
}


//fs.appendToFile(s3filepath,msg+"\n",errHandler); // I dont think we need s3 file , we can transform from csv anyway
//and generate s3 and bigquery csv
//if we should rollover wait for all filewrites to end then rollover --for now we are blindly rolling over

    if((Date.now()-fp.getFileStartTime(deliveryinfo.queue))>cfg.config["FILE_ROLLOVER_TIME"]){
	logger.info("rolling over .................");
        fs.rollOverTheFileSync(bqfilepath);
        //fs.rollOverTheFileSync(s3filepath,timestamp);
	fp.setFileStartTime(deliveryinfo.queue,Date.now());
	}
//messlog.info((Date.now()-tim)+" "+count);

}



function errHandler(err){
if(err) throw err;


}

 function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
  }

function loggerm(mess){// because during shutdown winston would still be buffering so we will use console.log
logger.info(mess);
console.log(mess);
} 

function shutdown(){
  loggerm( "\n trying to gracefully shut down from  SIGINT (Crtl-C)" );
  loggerm("Calling  connection end");
  connection.end();
if(filesuploader.canWeShutdown()){
   loggerm("no active bq importer is running");
   loggerm("no active bq importer is running");
	if(fs.allWritesDrained() && !connOn && rtd.canWeShutdown()){
  //if(fs.allWritesDrained()){
	loggerm("Actually exiting "); 

	sleep(3000);
	process.exit();
	}else{
	loggerm("Files are still being written we will wait or connection end is still not called connOn"+connOn);
	}

}else{ loggerm("bq importer is still running , we will tell to schedule no further "); filesuploader.shutdown()};

setTimeout(shutdown,10*1000);
}




process.on( 'SIGINT', shutdown);

process.on('uncaughtException', function (exception) {
    loggerm("unexcepted exception :"+exception.stack+ " Date : "+new Date());
    shutdown();    
  });


launch();

//TODO 1. graceful exit test 2. Log file rotation and config 3.File rotation to be synchronized 4. proper config 5 .fs operations to be flushed before shutdown
//TODO seperate buckets for different teams


