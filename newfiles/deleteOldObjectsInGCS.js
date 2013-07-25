var gcupload=require('./filesuploader/gsFileUploader.js');
var exec = require('child_process').exec;
var cfg=require('./config.js');
var filelogger = require('./logger.js').logger.loggers.get('fileuploader');
var logger = require('./logger.js').logger.loggers.get('bqimport');


deleteOlderObjects();

function deleteOlderObjects(){

var key = cfg.getBucketName("");

getTheListOfObjects(key);
}

function getTheListOfObjects(key){

console.log("key"+key);
	var gcmd="gsutil ls -R gs://"+key;
	executeCommand(gcmd, function (error,cmdResult){
     if(error){
         filelogger.error(" GS list failed "+new Date()+" cmd : "+gcmd+" error : "+error);
        //callback(error); // log exception
       // throw error;
       console.log("error"+error);
     }else{
      decisionToDeleteObjects(cmdResult);
     logger.info(" GS list successful result : "+new Date()+" cmd : "+gcmd+" cmd result : "+cmdResult);
     console.log("result",cmdResult);
     
   }
  }); 

}

function executeCommand(cmd,callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
      if(error){
        filelogger.error(" executeCommand failed : "+new Date()+" error :"+error+"cmd "+cmd);
        callback(error+stderr,null);
      }
      else
      {
         logger.info(" executeCommand success : "+new Date()+" result :"+stdout+stderr);
         callback(null,stdout.toString());
      }
   });
 }

function decisionToDeleteObjects(objNames){

var obj=objNames.split("gs");
console.log("decisionToDeleteObjects called"+obj.length);
for(var i=0;i<obj.length;i++){
if(obj[i].indexOf(".csv.20")==-1){

	continue;
}
else{

var stn=obj[i].toString();
var len=stn.split(".").length;
var dt=stn.split(".")[len-1];
var dtArr=dt.split("_");
console.log(" stn "+stn+" len "+len+" dt "+dt);
checkForDate(dtArr,obj[i]);
}
}

}

function checkForDate(dtArray,objToDel){
var d=new Date();
var nd=new Date(d.getFullYear(),d.getMonth(),d.getDate()-7,0,0,0);

console.log("d"+d);
console.log("nd"+nd);
var newDate=new Date(dtArray[0],dtArray[1]-1,dtArray[2]);
console.log("newDate"+newDate);

if(newDate<nd){

	deleteObj(objToDel);
}

}

function deleteObj(objToDel){
  console.log("objToDel"+objToDel);
  gcmd="gsutil rm gs"+objToDel;
  executeCommand(gcmd, function (error,cmdResult){
     if(error){
         filelogger.error(" Delete object failed "+new Date()+" cmd : "+gcmd+" error : "+error);
       
       console.log("error"+error);
     }else{
     logger.info(" delete successful for : " + objToDel+" date "+new Date()+" cmd : "+gscmd+" cmd result : "+cmdResult);
     console.log("result",cmdResult);
     
   }
  }); 

}