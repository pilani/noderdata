var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var cfg = require('../config.js');
var logger = require('../logger.js').logger.loggers.get('bqimport');
var filelogger = require('../logger.js').logger.loggers.get('fileuploader');


var no_bq_tasks_left_to_go = 0;
var enableBqImport = true;

exports.no_bq_tasks_left_to_go = no_bq_tasks_left_to_go;
exports.enableBqImport = enableBqImport;

exports.bqImportRunner =function bqImportRunner(){
  if(no_bq_tasks_left_to_go==0 && enableBqImport){   
     getBqCopyFiles(laucnBqUpload); 
  }
   setTimeout(bqImportRunner,1000*2*60);
}

function laucnBqUpload(err,files){
 if(err){
    filelogger.error(" laucnBqUpload  Failed : "+new Date()+" error : "+err);
 }else{
  no_bq_tasks_left_to_go = files.length;
  logger.info(" launching  Bq Copy : "+new Date()+" No of Files : "+no_bq_tasks_left_to_go);
  async.forEachSeries(files,processBqfile);
}
}

function processBqfile(file,callback){
   logger.info(" Copying  file to BQ from GS  Started: "+new Date()+" File Name : "+file.name);
    async.waterfall([function wrap(callback){callback(null,file.name,file.queName);},copyFileFromGSToBQ,decsionToMoveBQFile  
    ],finalCallBackBqCopy);

    callback();
}

function finalCallBackBqCopy(err,result){   
    no_bq_tasks_left_to_go -= 1;
    if(err){
       filelogger.error(" CALLBACK - Copying  file to BQ from GS  Failed: "+new Date()+" error : "+err+" no of pending files : "+no_bq_tasks_left_to_go);
    }else
    {
      logger.info(" CALLBACK - Copying  file to BQ from GS  Finshed: "+new Date()+" result : "+result+" no of pending files : "+no_bq_tasks_left_to_go);
    }    
}


function fileInfo(name,queName)
{
  this.name = name;
  this.queName  = queName;
}

function getBqCopyFiles(callback){  
  fs.readdir(cfg.config["GSUPLOADED_DATA_PATH"],function(error,files){
    if(error){
       filelogger.error(" GetBqCopy Files Failed "+new Date()+" error : "+error);
       callback(error);// log exception
    }
    else{
       var files = parseFilesToCopy(files);
       callback(null,files);
    }
  });
}

function copyFileFromGSToBQ(filename,queName,callback){
    var jobid=filename.replace(/\./g,"-");
    //var bqcmd ="bq  load --allow_quoted_newlines --job_id  "+jobid+" rbdata.prodtabledummy  gs://rdataprod-node/"+filename; 
    var bqcmd ="bq  load --allow_quoted_newlines --job_id  "+jobid+" "+cfg.getTableName(queName)+"  gs://"+cfg.getBucketName(queName)+filename; 
   logger.info(" Bq import cmd "+new Date()+" cmd : "+bqcmd);
    executeCommand(bqcmd, function (error,cmdResult,errorMessage){
          if(error){
            filelogger.error(" Bq import failed "+new Date()+" cmd : "+bqcmd+" error : "+error);
        callback(null,"Failed-"+filename); // log exception
       // throw error;
     }else{
      logger.info(" Bq import cmd successed result : "+new Date()+" cmd : "+bqcmd+" cmd result : "+cmdResult);
      callback(null,filename);
   }
  }); 
}

function decsionToMoveBQFile(filename,callback){
logger.info(" decsionToMoveBQFile called : "+new Date()+" File :"+filename);
 if(filename.indexOf("Failed")==-1){
    deleteBQCopiedFile(filename,callback);
 }else{  
     filename =  filename.split('-');
    copyFileToBQFailed(filename[1],callback);  
 }
}

function copyFileToBQFailed(filename,callback){
  logger.info(" copyFileToBQFailed called : "+new Date()+" File :"+filename);
   //var fcmd = "mv /home/bhaskar/.rdata/rfiles1/gsuploaded/"+filename+" "+ "/home/bhaskar/.rdata/rfiles1/bqfailed/";
   var fcmd= "mv "+cfg.config["GSUPLOADED_DATA_PATH"]+filename+" "+ cfg.config["BQFAILED_DATA_PATH"];
    executeCommand(fcmd, function (error,cmdResult,errorMessage){
        if(error){
          filelogger.error(" copyFileToBQFailed failed : "+new Date()+" File :"+filename+" error : "+error+" cmd : "+fcmd);
        callback(error); // log exception
       // throw error;
     }else{
      logger.info("copyFileToBQFailed successed result : "+new Date()+" cmd : "+fcmd+" cmd result : "+cmdResult);
     callback(null,filename);
   }
  });
}

function deleteBQCopiedFile(filename,callback){
    logger.info(" deleteBQCopiedFile called : "+new Date()+" File :"+filename);
  var dcmd = "rm -r "+cfg.config["GSUPLOADED_DATA_PATH"]+filename;
    executeCommand(dcmd, function (error,cmdResult,errorMessage){
          if(error){
        filelogger.error(" deleteBQCopiedFile failed : "+new Date()+" File :"+filename+" error : "+error+" cmd : "+dcmd);
        callback(error); // log exception
       // throw error;
     }else{
      logger.info("deleteBQCopiedFile successed result : "+new Date()+" cmd : "+dcmd+" cmd result : "+cmdResult);
     callback(null,filename);
   }
  });
  }


function fileInfo(name,queName)
{
  this.name = name;
  this.queName  = queName;
}

function parseFilesToCopy(files){
  var filesArray = new Array(); 
  var counter =0;
   for(var i in files){
        
        if(files[i].indexOf("csv.20")==-1){         
          continue;
        }
        var gsfile = files[i].toString();
        var qname= gsfile.split(".")[0];
      filesArray[counter] = new fileInfo(gsfile,qname);
        counter++;
    }

    return filesArray;
}

function executeCommand(cmd,callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
      if(error){
       // console.log("error in moving gs to bq failed "+stdout);
       filelogger.error(" executeCommand failed : "+new Date()+" error :"+error);
        callback(stdout+stderr);
      }
      else
      {
        //console.log("sdsdsd :"+stdout.toString());
        logger.info(" executeCommand success : "+new Date()+" result :"+stdout+stderr);
         callback(null,stdout.toString());
      }
   });
 }