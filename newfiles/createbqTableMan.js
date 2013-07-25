var exec = require('child_process').exec;
var schedule = require('node-schedule');
var cfg = require('../config.js');
var filelogger = require('../logger.js').logger.loggers.get('fileuploader');
var logger = require('../logger.js').logger.loggers.get('bqimport');

schedule.scheduleJob({hour: 17, minute: 54,
 dayOfWeek: 0}, function(){


createTableManually();
//setTimeout(cfg.abc,1000*20);

});

function createTableManually(){
	var d=new Date();
console.log(".."+d.getDay());


	console.log("date"+d.getDate()+d.getMonth()+d.getFullYear());

	var newTable='proddata_'+d.getDate()+'_'+d.getMonth()+'_'+d.getFullYear();
	console.log("new Table"+newTable);

//var bqcmd='bq cp weeklydummytable '+newTable+'_test';
var bqcmd="touch  /home/deepikajain/reload_doc.txt";
executeCommand(bqcmd, function (error,cmdResult,errorMessage){
          if(error){
         console.log("ERROR"+error);
       filelogger.error(" error in creating table " + error);

            
     }else{
    console.log("RESULT"+cmdResult);
   
    cfg.setProdTab(newTable);

   logger.info(" table creation successful :"+ newTable);
   }
  }); 
}

exports.getBaseTable=function getBaseTable(){
  console.log("inside getbasetable");
  
}


exports.setBaseTableName=setBaseTableName;
function setBaseTableName(baseTable){
this.baseTableName=baseTable;


}

function executeCommand(cmd,callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
      if(error){
       console.log("error in creating table "+error);
       filelogger.error(" executeCommand failed : "+new Date()+" error :"+error+" cmd : "+cmd);
        callback(error,null,null);
      }
      else
      {
        console.log("table creation successful :"+stdout.toString());
        logger.info(" executeCommand success : "+new Date()+" result :"+stdout+stderr);
         callback(null,stdout.toString(),stderr.toString());
      }
   });
 }