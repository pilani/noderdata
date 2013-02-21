var map = new Object();

//1- source account[region] 2 -destination account[region]
//2 - source account[region] 2 - destination account
//3 -

//real time data store configs
map["ALLOWED_QS"]= {"Q1":true,"Q2":true};// making the value false wont disable the queue u have to comple
//tely remove the element
map["MBS"] = 1000;
map["MONGO_EXP_TIME"] = "600";
//


map["MONGO_URL"]="xxx.com/rdatart";//for the real time data store
map["PG_URL"]="tcp://user:password@xxx.com/rdatarealtime";
map["ENABLE_RTD"]=false;

map["MIS"]="MIS";
map["FILE_ROLLOVER_TIME"]=1*60*1000;	
map["BASE_DATA_PATH"]="/home/username/.data/files1/";
map["SRV_FILE_PREFIX"]="1";// should be read outside the server
map["BASE_GSSTORAGE_BUCKET"]="GS_BUCKET_NAME/";
map["BASE_TABLE"]="BIG_QUERY_DATASET_NAME.BIG_QUERY_TABLE_NAME";
map["GSUPLOADED_DATA_PATH"]=map["BASE_DATA_PATH"]+"gsuploaded/";
map["BQFAILED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqfailed/";
map["BQIMPORTED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqimported/";
map["RABBIT-HOST"]="rabbitmqendpoint_URL";
map["HTTP-PORT"]="8080";
map["BQ_IMPORT_DELAY_TIME"]= 10;	
map["QS"]=["QNAME-1","QNAME-2","QNAME-3","QNAME-4","QNAME-5"];


map["Q_BUCKET_MAP"] = {"QNAME-4":"BIG_QUERY_DATASET_NAME.BIG_QUERY_TABLE_NAME",
"QNAME-5":"BIG_QUERY_DATASET_NAME.BIG_QUERY_TABLE_NAME"};


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