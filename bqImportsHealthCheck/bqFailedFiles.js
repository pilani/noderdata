var logger = require('../logger.js').logger;
var cfg =require('../config.js');
var exec = require('child_process').exec;

var dir = cfg.config["BASE_DATA_PATH"];
var bqcmd ="ls -cr "+dir+"bqfailed/ | grep \".csv.20\"";  
//console.log(bqcmd);
exports.bqGetListOfFailedFiles = function(req, res) {
bqGetListOfFailedFiles(function (response) {
res.send(response);
});
}; 

function fileInfo(name)
{
  this.name = name;
}

function bqGetListOfFailedFiles(callback)
{
  
executeCommand(bqcmd, function (cmdResult) {
       logger.info(" BQ FailedFiles cmdResult : "+cmdResult);
       
       if(cmdResult=='Error!')
       {
	  callback("Failed - CMD EXCUTION");
       }
       else
       {      
         //console.log(" cmd result :"+cmdResult); 
	  
           var files = cmdResult.split(/(\r?\n)/g);
          
	   var filesArray = new Array(); 
           var counter =0;
           for (var l=0; l<files.length; l++) 
           {
		if(files[l].length >1)
		{
                  // console.log(files[l]);
		   
		  filesArray[counter] = new fileInfo(files[l]);
 		  counter++;
		}
	   }
	
	  var jsonString = JSON.stringify(filesArray);
          callback(jsonString);
       }
}); 
}

function executeCommand(cmd, callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
        if(error)
	{	   
	    logger.info("BQ Failed Files Error communicating......."+stderr);
	    callback("Error!");
        }
	else
	{
	  callback(stdout.toString());
	}
   });    
}
