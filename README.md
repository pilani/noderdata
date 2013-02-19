<b>noderdata</b>
=========

noderdata is a module to consume  data from RabbitMQ server and push it into Google BigQuery. You can find more details
about the module.

Required Modules for noderdata :

amqp<br>
async<br>
express<br>
winston<br>
nib<br>
node-uuid<br>
jade<br>
stylus<br>

You can install using Node Package Manager (npm) with above modules.

Let me explain here how it works. Let's take an example - if you are pushing the data to multiple queues RabbitMQ, then 
you have to configure Queue names in config file(config.js) under QS attribute. Based on the queues defined in the 
config file it starts consuming the data from the server then creates a seprate file for each queue in Base data path 
defined in the config file.And also filerollover attribute defined in config file based on the file will be rollover 
with time stamp file name. 

gsFileuploader and bqFileuploader prallel running with some time out. 

gsFileuploader will pickup the rollover files from the base data path directory and push it into Google Cloud Storage once it succeeds then 
move it to "gsuploaded" folder the path is defined in config. 

bqFileuploader also picks up files from gsupload folder and imports files from the Google storage to BigQuery. 
If you want to move particular queue data to a seprate bucket, you can define the queue and bucket mapping under Q_BUCKET_MAP attribute in the config file. 
Once the import is sucessfull the file will be deleted from Gsupload folder, else will be moved to the bqfailed folder(path defined in config file).

We have a UI to show few stats in this module using Jade as a template engine and Stylus as CSS engine. 

Stats :    

           Pending Files  - It will show list of current pending files to upload.
           Failed Files  - It will show list of files that failed to upload.
           URL - IP of node running instance: port defined in config file/bqhome
    
  The RESTAPI is exposed, to keep hiting the URL and to check if there were any imports to BigQuery last x minutes,
  else throw message saying import failed.The x minutes value is defined in config value.
  
