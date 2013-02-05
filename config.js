var map = new Object();

//1- source account[region] 2 -destination account[region]
//2 - source  account[region] 2 - destination account
//3 -

map["MONGO_URL"]="ec2-54-251-95-173.ap-southeast-1.compute.amazonaws.com/rdatart";//for the real time data store
map["PG_URL"]="tcp://produser:password@ec2-54-251-95-173.ap-southeast-1.compute.amazonaws.com/rdatarealtime";
map["MONGO_EXP_TIME"] = "600";
map["MIS"]="MIS"; 
map["FILE_ROLLOVER_TIME"]=1*60*1000;	 	
map["BASE_DATA_PATH"]="/home/bhaskar/.rdata/rfiles1/";
map["SRV_FILE_PREFIX"]="1";// should be read outside the server
map["BASE_GSSTORAGE_BUCKET"]="rdataprod-node/";
map["BASE_TABLE"]="rbdata.dummy_node";
map["GSUPLOADED_DATA_PATH"]=map["BASE_DATA_PATH"]+"gsuploaded/";
map["BQFAILED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqfailed/";
map["BQIMPORTED_DATA_PATH"]=map["BASE_DATA_PATH"]+"bqimported/";
map["RABBIT-HOST"]="10.120.10.33";
map["HTTP-PORT"]="8080";
map["BQ_IMPORT_DELAY_TIME"]= 10;	 
//map["RABBIT-HOST"]="localhost";
/*map["QS"]=["DEFAULT","LIS","RBJAVA","BOSS","MIS","RBMAIN","VOLVO","UMS","QUOTABOSS",
		   "SEATSELLER","HD","RDATA_TRACK","DEFAULT_API","LIS_API","RBJAVA_API", "BOSS_API","MIS_API",
		    "RBMAIN_API","VOLVO_API","UMS_API","QUOTABOSS_API","SEATSELLER_API","HD_API",
		    "DEFAULT_IMP","LIS_IMP","RBJAVA_IMP","BOSS_IMP","MIS_IMP","RBMAIN_IMP","VOLVO_IMP"
		    ,"UMS_IMP","QUOTABOSS_IMP","SEATSELLER_IMP","HD_IMP","SS_PERF_BUCKET","SS_INVENTORY_BUCKET", 
		    "SS_API_BUCKET","RB_ANALYTICS_BUCKET","SS_USER_ANALYTICS_BUCKET"];*/

map["QS"]=["LIS","BOSS"];


map["Q_BUCKET_MAP"] = {"SS_PERF_BUCKET":"rbdata.SS_PERF_BUCKET",
					   "SS_INVENTORY_BUCKET":"rbdata.SS_INVENTORY_BUCKET",
						"SS_API_BUCKET":"rbdata.SS_API_BUCKET",
						"RB_ANALYTICS_BUCKET":"rbdata.RB_ANALYTICS_BUCKET",
						"SS_USER_ANALYTICS_BUCKET":"rbdata.SS_USER_ANALYTICS_BUCKET"};

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
