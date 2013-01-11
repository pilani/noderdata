//var logger = require('../logger.js').logger;
var exec = require('child_process').exec;

var dir = "/home/bhaskar/.rdata/rfiles1";
var bqcmd ="ls -cr "+dir+"/ | grep \".csv.20\"";  
console.log("cmd :"+bqcmd);
exports.bqGetListOfPendingFiles = function(req, res) {
bqGetListOfPendingFiles(function (response) {
res.send(response);
});
}; 

function fileInfo(name)
{
  this.name = name;
}

function bqGetListOfPendingFiles(callback)
{
  
executeCommand(bqcmd, function (cmdResult) {
      console.log(" cmdResult : "+cmdResult);
       
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
                   console.log(files[l]);
		   
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
	    console.log("BQ Pending Files Error communicating......."+stderr);
	    callback("Error!");
        }
	else
	{
	  callback(stdout.toString());
	}
   });    
}
