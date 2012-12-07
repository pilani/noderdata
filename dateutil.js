


exports.getTimeStamp= function getTimeStamp(){
var date = new Date();
var timestamp = date.getFullYear()+"_"+date.getMonth()+"_"+date.getDate()+"_"+date.getHours()+"_"+date.getMinutes();
return timestamp;
}
