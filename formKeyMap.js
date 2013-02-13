var uuid=require('node-uuid');
var formmapError = require('./logger.js').logger.loggers.get('FormMapError');



//console.log(makeRFCCompliant("asdad\"asdsa\"\"d"));
/*exports.formMapFromString = function formMapfromString(msg,keys,columns,ckmap){
var kvmap = new Object();
var kvpairs = msg.split(";");
        for(var i=0;i<kvpairs.length;i++){
          var kvpair=  kvpairs[i];
          var vals = kvpair.split(":");
          var key = keys[vals[0]];
           if(key!=null){
             kvmap[key]=vals[1];
           }
        }
   kvmap["UUID"]=uuid.v1();//Time based guid
      return kvmap;
}*/


exports.formMapFromString = function formMapfromString(msg,keys,columns,ckmap){
var iStart=0;
var kvmap = new Object();
var curKey,curVal,prevKey;
var val = msg;
        for(var i=0;i<val.length;i++){

                if(val[i]==':'){
                 curKey= val.substring(iStart,i);


                        if(keys[curKey]==undefined){
                         curKey=null;
                        }
                        else{
                        iStart=i;
                        }

                }else if(val[i]==';'){
                   if(curKey==null){
                     curVal=val.substring(iStart-1,i);

                     kvmap[prevKey]=kvmap[prevKey]+curVal;
                     iStart=i+1;
                   }else{
                     curVal=val.substring((iStart+1),i);

                     kvmap[curKey]=curVal;
                     iStart=i+1;
                     prevKey=curKey;
                     curKey=null;
                   }
                  curVal=null;
                }
       }
kvmap["UUID"]=uuid.v1();//Time based guid to distinguish each line at the consumer level
kvmap["CONSUMER_APP_TYPE"] = "NODE";
return kvmap;
}

exports.formMapFromStringV2 = function formMapfromStringV2(msg,keys,columns,ckmap){
var iStart=0;
var kvmap = new Object();
var curKey,curVal,prevKey;
var val = msg;
var iNextIndex =0;
var iStartIndex =0;
var prevKey = "";

console.log(" message : "+msg);
  for(;;){
    try{
    iNextIndex = val.indexOf(':',iStartIndex);
    if(iNextIndex == -1){
    kvmap["UUID"]=uuid.v1();//Time based guid to distinguish each line at the consumer level
    kvmap["CONSUMER_APP_TYPE"] = "NODE";      
    //  break;
   // printValues(kvmap);
    return kvmap;
    }
    
    var curKey = val.substring(iStartIndex,iNextIndex);    
    iStartIndex = iNextIndex+1;
    iNextIndex = val.indexOf(';',iStartIndex);
    var mval = val.substring(iStartIndex,iNextIndex);
    
    if(keys[curKey]==undefined)
    {
      kvmap[prevKey]=kvmap[prevKey]+curKey+mval;
    }
    else
    {      
      kvmap[curKey]= mval;
      prevKey = curKey;
    }

    iStartIndex = iNextIndex+1;  

   // console.log("Key : "+mkey+" val : "+mval);
  }
  catch(err){
     formmapError.error("error in parsing "+err.stack);
     kvmap["UUID"]=uuid.v1();//Time based guid to distinguish each line at the consumer level
     kvmap["CONSUMER_APP_TYPE"] = "NODE";
     kvmap["RESPONSE"] = err.stack;
     return kvmap;
   }
  }
}

function printValues(kvmap){
  for (var key in kvmap) {
    console.log(" key : "+keysy+ " Value : "+kvmap[key]);
  }
}
exports.formBqCompliantLine = function formBqCompliantLine(kvmap,columns,ckmap,ctypes){
   var bqline = '';
        for(var i=0;i<columns.length;i++){
             var key =ckmap[columns[i]];
              if(key!="null" && kvmap[key]!=undefined){
                var val = kvmap[key];
                val = makeRFCCompliant(val);
                val = checkForColumnType(key,val,ctypes[columns[i]]);
                bqline=bqline+val;
                }
            if(i<columns.length-1){
              bqline=bqline+",";

                }
        }
 return bqline;
}

function checkForColumnType(key,val,type){

 if(type=="string"){
    val= "\""+val+"\"";

  }else if(type=="integer"){
     if (!(/^\d*$/.test(val))){
        throw new Error("value is not an integer , key="+key+" val="+val);
        }
     }
   else if(type=="float"){
       if(isNaN(val)){
        throw  new Error("value is not a float or double , key="+key+" val="+val);
       }
   }else if(type=="boolean"){
     if(!(val.toLowerCase()=="true" || val.toLowerCase()=="false")){
        throw new Error("value is not a boolean, key="+key+" val="+val);

    }
   }

return val;
}

function makeRFCCompliant(val){
val = val.replace(/\"/g,"\"\"");
return val;
}

