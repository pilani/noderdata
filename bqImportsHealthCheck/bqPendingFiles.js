var logger = require('../logger.js').logger;
var cfg =require('../config.js');
var exec = require('child_process').exec;

var dir = cfg.config["BASE_DATA_PATH"];
var bqcmd ="ls -cr "+dir+"| grep \".csv.20\"";  
//console.log("cmd :"+bqcmd);
exports.bqGetListOfPendingFiles = function(req, res) {
bqGetListOfPendingFiles(function (response) {
res.send(response);
res.end();
});
}; 

function fileInfo(name)
{
  this.name = name;
}

function bqGetListOfPendingFiles(callback)
{
  
executeCommand(bqcmd, function (cmdResult) {
     logger.info(" Pending Files CmdResult : "+cmdResult);
       
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
	    logger.error("BQ Pending Files Error communicating......."+stderr+stdout);
	    callback("Error!");
        }
	else
	{
	  callback(stdout.toString());
	}
   });    
}
