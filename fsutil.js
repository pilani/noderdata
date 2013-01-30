var fs = require('fs');
var logger = require('./logger.js').logger;
var filelogger = require('./logger.js').logger.loggers.get('fileuploader');

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

exports.rollOverTheFileSync = function rollOverTheFileSync(path,timestamptoappend){
fs.renameSync(path,path+"."+timestamptoappend,, function (err){
	if(err){
		filelogger.error(" Renaming File throw exception : "+err);
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



