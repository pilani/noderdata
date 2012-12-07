var map = new Object();
map["MIS"]="MIS"; 
map["FILE_ROLLOVER_TIME"]=5*60*1000;	 	
map["BASE_DATA_PATH"]="/home/user/code/node/rdata-consumer-node/files/";
map["SRV_FILE_PREFIX"]="1";// should be read outside the server
map["BASE_GSSTORAGE_BUCKET"]="test-bucket/";
map["MIS_TABLE"]="prodtabledummy";
map["GSUPLOADED_DATA_PATH"]="/home/user/code/node/rdata-consumer-node/files/gsuploaded/";
map["BQFAILED_DATA_PATH"]="/home/user/code/node/rdata-consumer-node/files/bqfailed/";
map["BQIMPORTED_DATA_PATH"]="/home/user/code/node/rdata-consumer-node/files/bqimported/";
map["RABBIT-HOST"]="10.120.10.33";
map["QS"]=["MIS","MIS_API","LIS","LIS_API"];

exports.config=map;

exports.getFileName = function getFileName(qname){
return cfg.config["BASE_DATA_PATH"]+deliveryinfo.queue+"."+map["SRV_FILE_PREFIX"]+".csv";
}

exports.getBucketName = function getBucketName(qname){
return cfg.config["BASE_GSSTORAGE_BUCKET"];
}
