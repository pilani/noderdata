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

if(no_bq_tasks_left_to_go< 0)
     no_bq_tasks_left_to_go =0; // BAD- To be fixed by Pradeep.

  if(no_bq_tasks_left_to_go==0 && enableBqImport){   
     getBqCopyFiles(laucnBqUpload); 
  }
   setTimeout(bqImportRunner,1000*4*60);
}

function laucnBqUpload(err,map){
 if(err){
    filelogger.error(" laucnBqUpload  Failed : "+new Date()+" error : "+err);
 }else{
  no_bq_tasks_left_to_go = Object.keys(map).length;
  logger.info(" launching  Bq Copy : "+new Date()+" No of Files : "+no_bq_tasks_left_to_go);
  async.forEachSeries(Object.keys(map),function(key,callback){
    processBqfile(key,map[key],callback)
  });
}
}

function processBqfile(key,val,callback){
   logger.info(" Copying  file to BQ from GS  Started: "+new Date()+" table name : "+key +" no of files : "+val.length);
    async.waterfall([function wrap(callback){callback(null,key,val);},copyFileFromGSToBQ,decsionToMoveBQFile  
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

function copyFileFromGSToBQ(key,val,callback){
    var jobid=val[0].name.replace(/\./g,"-");
    //var bqcmd ="bq  load --allow_quoted_newlines --job_id  "+jobid+" rbdata.prodtabledummy  gs://rdataprod-node/"+filename; 
   // var bqcmd ="bq  load --allow_quoted_newlines --job_id  "+jobid+" "+cfg.getTableName(queName)+"  gs://"+cfg.getBucketName(queName)+filename; 
  var bqcmd="bq load --allow_quoted_newlines --job_id "+jobid+" "+key+" ";
  var counter =0;
  for(obj in val){    

    if(counter>0){
      bqcmd+=",";      
    }
    bqcmd+="gs://"+cfg.getBucketName(val[obj].queName)+val[obj].name;
    counter++;
  }
   logger.info(" Bq import cmd "+new Date()+" cmd : "+bqcmd);   
    executeCommand(bqcmd, function (error,cmdResult,errorMessage){
          if(error){
            filelogger.error(" Bq import failed "+new Date()+" cmd : "+bqcmd+" error : "+error);
        callback(null,"Failed-"+key,val); // log exception
       // throw error;
     }else{
      logger.info(" Bq import cmd successed result : "+new Date()+" cmd : "+bqcmd+" cmd result : "+cmdResult);
      callback(null,key,val);
   }
  }); 
}

function decsionToMoveBQFile(key,val,callback){
logger.info(" decsionToMoveBQFile called : "+new Date()+" key :"+key);
 if(key.indexOf("Failed")==-1){
    deleteBQCopiedFile(key,val,callback);
 }else{  
     key =  key.split('-');
    copyFileToBQFailed(key[1],val,callback);  
 }
}

function copyFileToBQFailed(key,val,callback){
  logger.info(" copyFileToBQFailed called : "+new Date()+" File :"+key);
   //var fcmd = "mv /home/bhaskar/.rdata/rfiles1/gsuploaded/"+filename+" "+ "/home/bhaskar/.rdata/rfiles1/bqfailed/";
   //var fcmd= "mv "+cfg.config["GSUPLOADED_DATA_PATH"]+filename+" "+ cfg.config["BQFAILED_DATA_PATH"];
    var fcmd="mv -t "+cfg.config["BQFAILED_DATA_PATH"]+" ";
 var counter =0;
  for(obj in val){
    if(counter>0){   
      fcmd+=" ";
    }
    fcmd+=cfg.config["GSUPLOADED_DATA_PATH"]+val[obj].name; 
     counter++;     
  }
    executeCommand(fcmd, function (error,cmdResult,errorMessage){
        if(error){
          filelogger.error(" copyFileToBQFailed failed : "+new Date()+" Table :"+key+" error : "+error+" cmd : "+fcmd);
        callback(error); // log exception
       // throw error;
     }else{
      logger.info("copyFileToBQFailed successed result : "+new Date()+" cmd : "+fcmd+" cmd result : "+cmdResult);
     callback(null,key,val);
   }
  });
}

function deleteBQCopiedFile(key,val,callback){
    logger.info(" deleteBQCopiedFile called : "+new Date()+" File :"+key);
  //var dcmd = "rm -r "+cfg.config["GSUPLOADED_DATA_PATH"]+filename;
   var dcmd="rm -r  ";
 var counter =0;
  for(obj in val){
    if(counter>0){   
      dcmd+=" ";
    }
    dcmd+=cfg.config["GSUPLOADED_DATA_PATH"]+val[obj].name;  
    counter++;     
  }
    executeCommand(dcmd, function (error,cmdResult,errorMessage){
          if(error){
        filelogger.error(" deleteBQCopiedFile failed : "+new Date()+" table :"+key+" error : "+error+" cmd : "+dcmd);
        callback(error); // log exception
       // throw error;
     }else{
      logger.info("deleteBQCopiedFile successed result : "+new Date()+" cmd : "+dcmd+" cmd result : "+cmdResult);
     callback(null,key,val);
   }
  });
  }


function fileInfo(name,queName)
{
  this.name = name;
  this.queName  = queName;
}

function parseFilesToCopy(files){
   var map = new Object(); 
   for(var i in files){
        
        if(files[i].indexOf("csv.20")==-1){         
          continue;
        }
        
        var gsfile = files[i].toString();
        var qname= gsfile.split(".")[0];
        var key = cfg.getTableName(qname);

        if(typeof map[key] == 'undefined'){
            var filesArray = new Array(); 
            var file = new fileInfo(gsfile,qname);
            filesArray.push(file);
            map[key] = filesArray;
        }else{
          var prevfilesArray = map[key];
           var file = new fileInfo(gsfile,qname);
           prevfilesArray.push(file);
           map[key] = prevfilesArray;
        }
    }

    return map;
}

function executeCommand(cmd,callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
      if(error){
       // console.log("error in moving gs to bq failed "+stdout);
       filelogger.error(" executeCommand failed : "+new Date()+" error :"+error+" cmd : "+cmd);
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
