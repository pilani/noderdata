var map = new Object();
map["MIS"]="MIS"; 
map["FILE_ROLLOVER_TIME"]=5*60*1000;	 	
map["BASE_DATA_PATH"]="/home/pradeep/.rdata/rfiles/";
map["SRV_FILE_PREFIX"]="1";// should be read outside the server
map["BASE_GSSTORAGE_BUCKET"]="rb-test-bucket/";
map["TABLE"]="rbdata.prodtabledummy";
map["GSUPLOADED_DATA_PATH"]=map["BASE_DATA_PATH"]+"gsuploaded/";
map["BQFAILED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqfailed/";
map["BQIMPORTED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqimported/";
map["RABBIT-HOST"]="10.120.10.33";
map["QS"]=["MIS","MIS_API","LIS","LIS_API"];

exports.config=map;

exports.getFileName = function getFileName(qname){
return map["BASE_DATA_PATH"]+qname+"."+map["SRV_FILE_PREFIX"]+".csv";
}

exports.getBucketName = function getBucketName(qname){
return map["BASE_GSSTORAGE_BUCKET"];
}


exports.getTableName = function getTableName(qname){
return map["TABLE"];
}
