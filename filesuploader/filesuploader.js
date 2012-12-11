var fs = require('fs');
var cfg = require('../config.js');
var exec = require('child_process').exec;
var logger = require('../logger.js').logger.loggers.get('bqimport');

var enableBqImport = true;
exports.shutdown= function (){enableBqImport=false};

exports.startup = function startup(){
setTimeout(gsuploadRunner(),1000*60);
setTimeout(bqImportRunner(),1000*60);
}


var gsuploadRunning=0;
var bqImportrunning=0;

exports.canWeShutdown = function canWeShutdown(){
 if(gsuploadRunning==0 && bqImportrunning==0){
  return true;
 }
  return false;
}

function gsuploadRunner(){
  if(gsuploadRunning==0 && enableBqImport){
     gsupload();

  }
     setTimeout(gsuploadRunner,1000*2*60);
}

function bqImportRunner(){
  if(bqImportrunning==0 && enableBqImport){
     bqimport();

  }
     setTimeout(bqImportRunner,1000*2*60);
}

/**
Scan all the files that rolled out from the consumer. Upload the csv file to bigquery and move the csv and s3 file to 
gsuploaded folder
*/
function gsupload(){
// scan and get all s3 and .csv files
gsuploadRunning++;
logger.info("calling gs upload scanning base path "+cfg.config["BASE_DATA_PATH"]);
fs.readdir(cfg.config["BASE_DATA_PATH"],function(err,files){

     for(var i in files){

        if(files[i].indexOf("csv.20")==-1){//looks ugly but works in this millenium
          continue;
        }
	gsuploadRunning++;
        var gsfile = files[i].toString();
        var qname= gsfile.split(".")[0];//hardcoded for now
        //call gsupload 
	var gscmd = "gsutil cp "+cfg.config["BASE_DATA_PATH"]+gsfile+" gs://"+cfg.getBucketName(qname);
          logger.info("gs command : "+gscmd);
          exec(gscmd,function(error,stdout,stderr){
		if(error){
		 logger.error("error in gs copy "+stderr+stdout)
                 gsuploadRunning--;
		 }
                else{
                         //move files to gsuploaded folder
                         logger.info("gs upload succeded"+gscmd);
                        var cmd = "mv "+cfg.config["BASE_DATA_PATH"]+gsfile+" "+cfg.config["GSUPLOADED_DATA_PATH"];
                        logger.info(cmd);
                        exec(cmd,
                              function(error,stdout,stderr){gsuploadRunning--;if(error){logger.error("error in moving gsuploaded file "+stderr+stdout);}});
                    }
                
             });

     }
   gsuploadRunning--;
});

}


function bqimport(){
// scan all gsuploaded files
logger.info("calling bqimport "+cfg.config["BASE_DATA_PATH"]);
bqImportrunning++;
fs.readdir(cfg.config["GSUPLOADED_DATA_PATH"],function(err,files){

     for(var i in files){

         if(files[i].indexOf("csv.20")==-1){
            continue;
         }
         bqImportrunning++;
         var gsfile = files[i].toString();
         

        var qname= gsfile.split(".")[0];//hardcoded for now
	var jobid=gsfile.replace(/\./g,"-");
          //using filename as the job id to prevent duplicate imports into bigquery
	  var bqcmd ="bq  load --job_id  "+jobid+" "+cfg.getTableName(qname)+"  gs://"+cfg.getBucketName(qname)+gsfile; 
          logger.info(bqcmd);
          exec(bqcmd,function(error,stdout,stderr){
		
		if(error){
		 logger.error("error in bq load"+ stderr);
		 logger.error("error in bq load "+stdout+" "+error);
                          //we should move them to failed folders
		  var fcmd = "mv "+cfg.config["GSUPLOADED_DATA_PATH"]+gsfile+" "+ cfg.config["BQFAILED_DATA_PATH"];
	          logger.info(fcmd);
                  exec(cmd,
                              function(error,stdout,stderr){
				bqImportrunning--;
				if(error){
                                 logger.error("error in moving gs to bq failed "+stderr+stdout);
				}
                             
                                
                             });
		 }
                else{
                logger.info("bq load succeded");
		var scmd = "mv "+cfg.config["GSUPLOADED_DATA_PATH"]+gsfile+" "+cfg.config["BQIMPORTED_DATA_PATH"];
       			 logger.info(scmd);
                          exec(scmd,
                              function(error,stdout,standerr){
                                 bqImportrunning--;
				if(error){
                                 logger.error("err in moving gscopy to bqimported "+stderr+" "+stdout+" "+error);
				}
                                  else{
                                         // eventually we'll need to upload s3file to s3 and .csv file should be deleted
					}
                             });
                    }
             });

     

 }
});
bqImportrunning--;
}

