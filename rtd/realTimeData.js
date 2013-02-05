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

function pgQuery(query,callback){
	pgClient.query(query,function (err,result){
        if(err){
        	loggit("error in querying pg"+err.stack);
        	throw err;
        }
        callback(result);
	});
}


/*take the key value map and log it to real time storage which in our case is mongodb*/
 function log2RealTimeDataStore(kvmap){

     for(var key in kvmap){
     	singleRow.setValue(key,kvmap[key]);
     }
     singleRow.save(function(err){loggit(err)});

}

function loggit(mess){
	rtd.log(mess);
}



//test();

function test(){
    var obj = new Object();
    obj["key1"] = "value1";
    obj["key2"] = "value2";
	log2RealTimeDataStore(obj);
    //pgQuery("select count(*) from customer_reviews",function(result){loggit("The result is "+JSON.stringify(result))});
}

