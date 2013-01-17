var logger = require('../logger.js').logger;
var cfg =require('../config.js');
var exec = require('child_process').exec;

//var bqcmd ="bq  ls -j --max_results=50"; 

//var bqcmd ="bq  ls -j --max_results=40 | grep load";

var bqcmd ="bq ls -j | awk 'NR <= 2 || $2==\"load\" {print $0}' | head -n7";  

//console.log(" comand is ..."+bqcmd);

//bq  load --allow_quoted_newlines --job_id  bhaskar_1_1_13  rbdata.prodtabledummy  gs://rdataprod-v2/mdatapathv2/bhaskar.csv
//gsutil cp bhaskar.csv gs://rdataprod-v2/mdatapathv2/bhaskar.csv

exports.bqImportsHealthCheckService = function(req, res) {
bqImportsHealthCheck(function (response) {
res.send(response);
});
}; 

function bqImportsHealthCheck(callback)
{
  
executeCommand(bqcmd, function (cmdResult) {
    // console.log(" cmdResult : "+cmdResult);
       logger.info("BQ IMPORTS HEALTH CHECKS cmdResult : "+cmdResult);
       
       if(cmdResult=='Error!')
       {
	  callback("Failed - CMD EXCUTION");
       }
       else
       {      
           var lines = cmdResult.split(/(\r?\n)/g);
       
           for (var l=0; l<lines.length; l++) 
           {
             // Process the line, noting it might be incomplete.
            //  console.log(" r id ...:"+lines[l]+" length :"+lines[l].length);	
	  
	     if(lines[l].length >1)
	     {
	      // console.log(" s  id ...:"+lines[l]+" length :"+lines[l].length);	
	       var row = prepareColumnValuesWithDelimter(lines[l]); 		
             
	       var columns =  row.split('#');
	       var jobId = columns[0]; // query or load
	       var jobType = columns[1]; // query or load
	       var jobStatus = columns[2]; //SUCCESS,Running,Pending,FAILURE
               var lastRunTime = columns[5];//16:12:26--hh:mm:ss
	    
	        if(jobStatus == 'SUCCESS' || jobStatus == 'FAILURE')
	        {
                  var resp = checkJobStatus(jobId,jobType,jobStatus,lastRunTime);
		  callback(resp);
		  break;
	        }
             }
	   }
       }
}); 
}

function checkJobStatus(jobId,jobType,jobStatus,lastRunTime)
{
      if(jobStatus == 'SUCCESS')
      {
        logger.info(" job  : "+jobType+" Job Status :"+jobStatus+" lastRunTime :"+lastRunTime+" job Id :"+jobId);
     
        var tmh = lastRunTime.split(':');
        var today = new Date();
			    
        var prevJobExceTime = new Date(today.getFullYear(),today.getMonth(),today.getDate());
        prevJobExceTime.setHours(tmh[0]);
        prevJobExceTime.setMinutes(tmh[1]);
        prevJobExceTime.setMilliseconds(tmh[2]);
	            
        var elapsed = today - prevJobExceTime; // time in milliseconds
	var importDelay = ((elapsed * 1)/1000)/60;
        
	logger.info("BQ IMPORTS HEALTH CHECKS last job excuted time :"+importDelay);	
	

	if(importDelay > cfg.config['BQ_IMPORT_DELAY_TIME'])
	{
	  return "Failed - Import Delay  "+importDelay +"  Id - "+jobId;
	}
	
	return "Fine - "+jobId;
      }
     else if(jobStatus == 'FAILURE')
     {
	return "Failed - "+jobId;
     }
}
 
function prepareColumnValuesWithDelimter(rowline)
{
   var a = rowline.split(' ');	 

   var rowValue = '';
   
   for(var i=0;i<a.length;i++)
   {
      if(a[i].trim() =='')
	 continue;
			
      if(rowValue!='')
	  rowValue+='#';

	rowValue+=a[i];
		       
       //console.log("column value  counter : "+i +" value : "+ a[i]);	
   }	
 
   logger.info("BQ IMPORTS HEALTH CHECKS rowvalueWithDelimter : "+rowValue);
   //job_4d029620bd894c52a79ac235ff67ae5f#query#SUCCESS#31#Dec#16:00:25#0:00:01	  

   return rowValue;
}

function executeCommand(cmd, callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
        if(error)
	{	   
	    logger.info("BQ IMPORTS HEALTH CHECKS Error communicating......."+stderr);
	    callback("Error!");
        }
	else
	{
	  callback(stdout.toString());
	}
   });    
}
