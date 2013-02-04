var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var cfg = require('../config.js');
var logger = require('../logger.js').logger.loggers.get('bqimport');
var filelogger = require('../logger.js').logger.loggers.get('fileuploader');

var no_gs_tasks_left_to_go = 0;
var enableGsImport = true;

exports.no_gs_tasks_left_to_go = no_gs_tasks_left_to_go;
exports.enableGsImport = enableGsImport;

exports.gsuploadRunner=function gsuploadRunner(){
  if(no_gs_tasks_left_to_go==0&&enableGsImport){   
     getGSCopyFiles(laucnGsUpload); 
  }
   setTimeout(gsuploadRunner,1000*2*60);
}


function laucnGsUpload(err,map){
 if(err){
  filelogger.error(" laucnGsUpload  Failed : "+new Date()+" error : "+err);
 }else{
   no_gs_tasks_left_to_go = Object.keys(map).length;
  logger.info(" launching  Bq Copy : "+new Date()+" No of Files : "+no_gs_tasks_left_to_go);  
   async.forEachSeries(Object.keys(map),function(key,callback){
    processGsfile(key,map[key],callback)
  });
}
}

function processGsfile(key,val,callback){
  logger.info(" Copying  file to GS  Started: "+new Date()+" Bucket Name : "+key+" no of files : "+val.length);
    async.waterfall([function wrap(callback){callback(null,key,val);},moveFileToGS,moveFileToGSUploaded  
    ],finalCallBackGSCopy);

    callback();
}

function finalCallBackGSCopy(err,result){   
    no_gs_tasks_left_to_go -= 1;
    if(err){
       filelogger.error(" CALLBACK - Copying  file to BQ from GS  Failed: "+new Date()+" error : "+err+" no of pending files : "+no_gs_tasks_left_to_go);
    }else
    {
      logger.info(" CALLBACK - Copying  file to BQ from GS  Finshed: "+new Date()+" result : "+result+" no of pending files : "+no_gs_tasks_left_to_go);
    } 
}


function fileInfo(name,queName)
{
  this.name = name;
  this.queName  = queName;
}

function getGSCopyFiles(callback){  
  fs.readdir(cfg.config["BASE_DATA_PATH"],function(error,files){
    if(error){
     filelogger.error(" GetGsCopy Files Failed "+new Date()+" error : "+error);
     callback(error);// log exception
    }
    else{
       var files = parseFilesToCopy(files);
       callback(null,files);
    }
  });
}

function parseFilesToCopy(files){
  var map = new Object(); 
   for(var i in files){
        
        if(files[i].indexOf("csv.20")==-1){         
          continue;
        }
        
        var gsfile = files[i].toString();
        var qname= gsfile.split(".")[0];
        var key = cfg.getBucketName(qname);

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
        filelogger.error(" executeCommand failed : "+new Date()+" error :"+error+"cmd "+cmd);
        callback(stderr);
      }
      else
      {
         logger.info(" executeCommand success : "+new Date()+" result :"+stdout+stderr);
         callback(null,stdout.toString());
      }
   });
 }

 function moveFileToGS(key,val,callback){
  //console.log("moveFileToGS :"+filename);
 // var gscmd = "gsutil cp /home/bhaskar/.rdata/rfiles1/"+filename+" gs://rdataprod-node/";
  //var gscmd = "gsutil cp "+cfg.config["BASE_DATA_PATH"]+filename+" gs://"+cfg.getBucketName(queName);
  var gscmd='';
  for(obj in val){    

    if(gscmd!=''){
      gscmd+=";";      
    }
    gscmd+="gsutil cp "+cfg.config["BASE_DATA_PATH"]+val[obj].name+" gs://"+key;
  }
  logger.info(" GS import cmd "+new Date()+" cmd : "+gscmd);
  executeCommand(gscmd, function (error,cmdResult){
     if(error){
         filelogger.error(" GS import failed "+new Date()+" cmd : "+gscmd+" error : "+error);
        callback(error); // log exception
       // throw error;
     }else{
     logger.info(" GS import cmd successed result : "+new Date()+" cmd : "+gscmd+" cmd result : "+cmdResult);
     callback(null,key,val);
   }
  }); 
}
function moveFileToGSUploaded(key,val,callback){
//  console.log(callback);
 // var cmd = "mv "+cfg.config["BASE_DATA_PATH"]+filename+"  "+cfg.config["GSUPLOADED_DATA_PATH"];
 var cmd="mv -t "+cfg.config["GSUPLOADED_DATA_PATH"]+" ";
 var counter =0;
  for(obj in val){
    if(counter>0){   
      cmd+=" ";
    }
    cmd+=cfg.config["BASE_DATA_PATH"]+val[obj].name;  
    counter++;     
  }
  executeCommand(cmd, function (error,cmdResult){
      if(error){
         filelogger.error(" moveFileToGSUploaded failed "+new Date()+" cmd : "+cmd+" error : "+error);
       callback(error); // log exception
        //throw error;
     }
     else{
       logger.info(" moveFileToGSUploaded successed result : "+new Date()+" cmd : "+cmd+" cmd result : "+cmdResult);
     callback(null,"done");
    }
  }); 
}
