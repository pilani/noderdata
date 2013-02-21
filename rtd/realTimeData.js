var mongoose = require('mongoose'),Schema = mongoose.Schema,cfg = require('../config.js').config;
var pg = require('pg');
var rtd = require('../logger.js').logger.loggers.get('rtd');



var pgconnectstring = cfg["PG_URL"];
var pgClient = new pg.Client(pgconnectstring);
pgClient.connect(function(err){
    if(err)
    loggit("error in pg connect "+err.stack);
});


var rdataSchema = new Schema({

 mserverTime:{ type: Date, default: Date.now }
});// table rotation not needed as we have in-built ttl based expiry 
rdataSchema.index({ "mserverTime": 1 }, { expireAfterSeconds: cfg["MONGO_EXP_TIME"] });

mongoose.model('rdata', rdataSchema);
mongoose.connect('mongodb://'+cfg["MONGO_URL"],function(err){if(err){loggit("error in connecting to mongo"+err.stack)}});
var Rdata = mongoose.model('rdata');
var singleRow = new Rdata({
     });
singleRow.setValue("key","value");
singleRow.save(function(err){loggit(err)});

exports.pgQuery = function pgQuery(query,callback){
	pgClient.query(query,function (err,result){
        if(err){
        	loggit("error in querying pg"+err.stack);
        	throw err;
        }
        callback(result);
	});
}


/*take the key value map and log it to real time storage which in our case is mongodb*/
var rtdLeft =0;
exports.log2RealTimeDataStore = log2RealTimeDataStore;

function log2RealTimeDataStore(kvmap){
     //console.log("LOGGING RTD");
     if(cfg["ENABLE_RTD"]){
        console.log("dasdsad");
     var singleRow = new Rdata({
     });

     for(var key in kvmap){
        singleRow.setValue(key,kvmap[key]);
     }
     rtdLeft++;
     singleRow.save(function(err){rtdLeft--; loggit(err)});
    }
}

var mdocs= [];

function log2RealTimeDataStor(kvmap,queue){
     
     if(cfg["ENABLE_RTD"] && !(cfg["ALLOWED_QS"][queue] === undefined)){
    
     var doc = new Object() ;
     doc["mserverTime"] = new Date();
     for(var key in kvmap){
        doc[key]=kvmap[key];
     }
     mdocs.push(doc);
     if(mdocs.length>cfg["MBS"]){
        flush2Rtsd();
     }
    
    }
}

//flush to real time storage
function flush2Rtsd(){
    loggit(" mdocs length "+mdocs.length+new Date());
    if(mdocs.length==0) return;
    rtdLeft++;
 Rdata.collection.insert(mdocs,{},function(err){
    rtdLeft--;
   if(err){
    loggit(" error in flushing to mongo "+err);
   }else{ loggit(" successfully flished to mongo "+new Date()+ "   "+ sdate) };
 });
   mdocs = [];
}

function loggit(mess){
    console.log(mess);
	rtd.log(mess);
}

exports.canWeShutdown = function canWeShutDown(){
    if(mdocs.length ==0 && rtdLeft==0){
        loggit(" rtd is shutdown")
        return true;
    }
    loggit(" rtd can't be shutdown yet");
   return false;
}


exports.shutDown = function shutDown(){
     flush2Rtsd();// flush out any remaining rtds;
}

//test();
var sdate ;
function test(){
    var obj = new Object();
    obj["key1"] = "value1";
    obj["key2"] = "value2";
    for(var j;j<30;j++){
        obj[j]="adasdsadkasdkahsdkhashdkashdkhaskdhksahdkhaskdhakshdkahdkhkashdkhaksdhkahsdkhaskdhhduashdsauhdkuahsduh";
    }
    sdate= new Date();
    console.log("test started "+new Date());
   for(var i =0 ;i< 100000;i++){
	obj["i"]= i;
    log2RealTimeDataStor(obj,"MISn");
    break;
    }
    flush2Rtsd();
    console.log(" test ended "+new Date());
    //pgQuery("select count(*) from customer_reviews",function(result){loggit("The result is "+JSON.stringify(result))});
}

