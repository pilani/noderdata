var map = new Object();

//1- source account[region] 2 -destination account[region]
//2 - source  account[region] 2 - destination account
//3 -

map["MONGO_URL"]="xxx.com/rdatart";//for the real time data store
map["PG_URL"]="tcp://user:password@xxx.com/rdatarealtime";
map["ENABLE_RTD"]=false;
map["MONGO_EXP_TIME"] = "600";
map["MIS"]="MIS"; 
map["FILE_ROLLOVER_TIME"]=1*60*1000;	 	
map["BASE_DATA_PATH"]="/home/pradeep/.rdata/rfiles1/";
map["SRV_FILE_PREFIX"]="1";// should be read outside the server
map["BASE_GSSTORAGE_BUCKET"]="rdataprod-node/";
map["BASE_TABLE"]="rbdata.dummy_node";
map["GSUPLOADED_DATA_PATH"]=map["BASE_DATA_PATH"]+"gsuploaded/";
map["BQFAILED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqfailed/";
map["BQIMPORTED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqimported/";
map["RABBIT-HOST"]="rabbitmqendpoint.com";
map["HTTP-PORT"]="8080";
map["BQ_IMPORT_DELAY_TIME"]= 10;	 

map["QS"]=["QNAME"];


map["Q_BUCKET_MAP"] = {"BUCKET_1":"rbdata.PERF_BUCKET",
					   "BUCKET_2":"rbdata.INVENTORY_BUCKET"};

exports.config=map;

exports.getFileName = function getFileName(qname){
return map["BASE_DATA_PATH"]+qname+"."+map["SRV_FILE_PREFIX"]+".csv";
}

exports.getBucketName = function getBucketName(qname){
return map["BASE_GSSTORAGE_BUCKET"];
}


exports.getTableName = function getTableName(qname){
//return map["BASE_TABLE"];
var qbucketArr = map["Q_BUCKET_MAP"];
if(typeof qbucketArr[qname] == 'undefined')
  return map["BASE_TABLE"];

return qbucketArr[qname];
}
