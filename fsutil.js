var fs = require('fs');
var logger = require('./logger.js').logger;
var fileNotFoundlogger = require('./logger.js').logger.loggers.get('FileNotFoundError');
var du=require('./dateutil.js');

var opencalls = 0;
var callback= function(err){
opencalls--;
if(err){
throw err;
}
}

exports.appendToFile = function appendToFile(path,data){
opencalls++;
fs.appendFile(path,data,callback);

}

exports.rollOverTheFileSync = function rollOverTheFileSync(path){
	fs.exists(path, function(exists) {
  		if (exists) {
   		 // rename file
   		 	renameFile(path);
  		} else {
    		// not found
    		fileNotFoundlogger.error(" File Not found : "+path+" date : "+new Date());
 		 }
 		});
}

function renameFile(path){	
    var timestamptoappend = du.getTimeStamp();
	fs.renameSync(path,path+"."+timestamptoappend,function (err){
	if(err){
		fileNotFoundlogger.error(" Renaming File throw exception : "+err);
	}
});
}



exports.allWritesDrained= function allWritesDrained(){
	logger.info("open calls left "+opencalls);
	console.log("open calls left "+opencalls);
  if(opencalls==0){
    return true;
  }
  return false;
}



