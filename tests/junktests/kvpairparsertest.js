var val ="API_NAME:ada;d;APP_LOCAL_IP:10.120.0.11;";
var keyss= require('../../keys.js');
console.log(val.length);
var keys = keyss.keys;
var map = pars(val,keys);


for(var key in map){
 console.log("key-"+key+" val-"+map[key]);
 console.log("\n");
}
function logger(val){
console.log(val);
}
function pars(val,keys){
var iStart=0;
var map = new Object();
var curKey,curVal,prevKey;
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
                      
                     map[prevKey]=map[prevKey]+curVal;
                     iStart=i+1;
                   }else{
		     curVal=val.substring((iStart+1),i);
                     
                     map[curKey]=curVal;
		     iStart=i+1;
                     prevKey=curKey;
                     curKey=null;
                   }
                  curVal=null;
		}
       }
return map;
}
