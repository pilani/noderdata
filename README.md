<b>noderdata</b>
=========

noderdata is a module to consume streaming data from a RabbitMQ server convert it to BigQuery Compliant File , eventually uploading it Google Storage and finally importing into  Google BigQuery.

Required Modules for noderdata :

amqp<br>
async<br>
express<br>
winston<br>
nib<br>
node-uuid<br>
jade<br>
stylus<br>
mongoose<br>

You can install using Node Package Manager (npm) with above modules.

Let me explain here how it works. Let's take an example - if you are pushing the data into multiple queues in RabbitMQ, then 
you have to configure Queue names in config file(config.js) under QS attribute. Based on the queues defined in the 
config file it starts consuming the data from the server then creates a separate file for each queue in Base data path 
(also defined in the config file) ,and based file rollover time mentioned in the config , the file is rolled over with an appended timestamp. 

Along with high thorughput consumption there are two separate processes 
gsFileuploader and bqFileuploader which run in parallel.

gsFileuploader will pickup the rolled over  files from the base data path directory and push it into Google Cloud Storage once it succeeds then it is moved to "gsuploaded" folder.

bqFileuploader picks up files from "gsuploaded" folder and  imports files from Google storage to BigQuery. 
If you want to move particular queue data to a seprate bucket, you can define the queue and bucket mapping under Q_BUCKET_MAP attribute in the config file. 
Once the import is sucessfull the file will be deleted from Gsupload folder, else will be moved to the bqfailed folder(path defined in config file).

We have a UI to show few stats in this module using Jade as a template engine and Stylus as CSS engine. 

Stats :    

           Pending Files  - shows list of current pending files to upload.
           Failed Files  -  shows list of files that failed to upload.
           URL - IP of node running instance: port defined in config file/bqhome
    
  These stats are exposed as RESTAPI which can be monitored using a url Monitoring service like site 24*7
  to know whether there are failures in consumption,gs imports or bigquery imports.
  
