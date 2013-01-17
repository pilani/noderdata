exports.bqimportsstatus = function(req, res) {
res.send();
}; 

var exec = require('child_process').exec;

//var bqcmd ="bq  ls -j --max_results=50"; 

var bqcmd ="bq  ls -j --max_results=20 | grep load"; 

//console.log(" comand is ..."+bqcmd);

//bq  load --allow_quoted_newlines --job_id  bhaskar_1_1_13  rbdata.prodtabledummy  gs://rdataprod-v2/mdatapathv2/bhaskar.csv
//gsutil cp bhaskar.csv gs://rdataprod-v2/mdatapathv2/bhaskar.csv

executeCommand(bqcmd, function (cmdResult) {
     
       console.log(" cmdResult : "+cmdResult);
       
       if(cmdResult=='Error!')
       {
	        //failed
       }
       else
       {      
           var lines = cmdResult.split(/(\r?\n)/g);
       
           for (var l=0; l<lines.length; l++) 
           {
             // Process the line, noting it might be incomplete.
              console.log(" r id ...:"+lines[l]+" length :"+lines[l].length);	
	  
	     if(lines[l].length >1)
	     {
	       console.log(" s  id ...:"+lines[l]+" length :"+lines[l].length);	
	       var row = prepareColumnValuesWithDelimter(lines[l]); 		
             
	       var columns =  row.split('#');
	       var jobType = columns[1]; // query or load
	       var jobStatus = columns[2]; //SUCCESS,Running,Pending,FAILURE
               var lastRunTime = columns[5];//16:12:26--hh:mm:ss
	    
	        if(jobStatus == 'SUCCESS' || jobStatus == 'FAILURE')
	        {
                  checkJobStatus(jobType,jobStatus,lastRunTime);
		  break;
	        }
             }
	   }
       }
}); 

function checkJobStatus(jobType,jobStatus,lastRunTime)
{
      if(jobStatus == 'SUCCESS')
      {
        // console.log(" job  : "+jobType+" Job Status :"+jobStatus+" lastRunTime :"+lastRunTime+" job Id :"+columns[0]);
     
        var tmh = lastRunTime.split(':');
        var today = new Date();
			    
        var prevJobExceTime = new Date(today.getFullYear(),today.getMonth(),today.getDate());
        prevJobExceTime.setHours(tmh[0]);
        prevJobExceTime.setMinutes(tmh[1]);
        prevJobExceTime.setMilliseconds(tmh[2]);
	            
        var elapsed = today - prevJobExceTime; // time in milliseconds
        console.log(" last job excuted time :"+((elapsed * 1)/1000)/60);	
      }
     else if(jobStatus == 'FAILURE')
     {
	console.log(" job failed...");
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
 
   console.log(" rowvalueWithDelimter : "+rowValue);
   //job_4d029620bd894c52a79ac235ff67ae5f#query#SUCCESS#31#Dec#16:00:25#0:00:01	  

   return rowValue;
}

function executeCommand(cmd, callback) 
{
   exec(cmd,function(error,stdout,stderr)
   {
        if(error)
	{
	    console.log(" Error communicating......."+stderr);
	    callback("Error!");
        }
	else
	{
	  callback(stdout.toString());
	}
   });    
}

