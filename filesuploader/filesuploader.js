var bqf = require('./bqFileUploader.js'); 
var gsf = require('./gsFileUploader.js'); 
var filelogger = require('../logger.js').logger.loggers.get('fileuploader');


exports.shutdown= function (){
  
  filelogger.info(" fileuploader started shuttingdown : "+new Date()+" GS enableGsImport : "
    +gsf.enableGsImport+"  BQ enableBqImport : "+ bqf.enableBqImport);

  gsf.enableGsImport=false;
  bqf.enableBqImport=false

  filelogger.info(" fileuploader shutdown : "+new Date()+" GS enableGsImport : "
    +gsf.enableGsImport+"  BQ enableBqImport : "+ bqf.enableBqImport);
};

exports.startup = function startup(){
filelogger.info(" fileuploader started : "+new Date());
setTimeout(gsf.gsuploadRunner,1000*60);
//setTimeout(bqf.bqImportRunner,1000*60);
}

exports.canWeShutdown = function canWeShutdown(){

filelogger.info(" fileuploader got signal for shutdwon : "+new Date()+" GS No of Task to finsh : "
    +gsf.no_gs_tasks_left_to_go+"  BQ No of Task to finsh : "+ bqf.no_bq_tasks_left_to_go);

 if(gsf.no_gs_tasks_left_to_go==0 && bqf.no_bq_tasks_left_to_go==0){
  return true;
}else{
  return false;
}
}
