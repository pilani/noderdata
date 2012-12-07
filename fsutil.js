var fs = require('fs');
var logger = require('./logger.js').logger;

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
fs.renameSync(path,path+"."+timestamptoappend);
}

exports.allWritesDrained= function allWritesDrained(){
	logger.info("open calls left "+opencalls);
  if(opencalls==0){
    return true;
  }
  return false;
}



