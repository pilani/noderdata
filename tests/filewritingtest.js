var fs = require('fs');

var errfunction=function(err){if(err) throw err};


var map = new Object();

test();
var bufferfull=false;
var starttime = Date.now();


function tes(){
	if(!bufferfull){
 write("filetest.txt",Date.now()+"\n",null);
}else{
console.log("nothing to write as buffer is full");

}
if((Date.now()-starttime)> (1000*10)){
console.log("done writing");
return;
}

}
}


function test(){

while(true){



//appendToFile("filetest.txt",Date.now(),null);
if(!bufferfull){
write("filetest.txt",Date.now()+"\n",null);
}else{
console.log("nothing to write as buffer is full");
continue;
}
if((Date.now()-starttime)> (1000*10)){
console.log("done writing");
break;
}

}
}

var encoding = 'utf-8';
function appendToFile(path,data,callback){
fs.appendFile(path,data,errfunction);

}

function write(path,data){
var writableStream = map[path];
 if(writableStream){
    var state = writableStream.write(data);
     
    if(state==false){
     bufferfull=true;
     console.log("buffer full");
     }
 }else{
   console.log("creating new writableStream");
   var writableStream = fs.createWriteStream(path,{ bufferSize: 10000 * 1024 });
    writableStream.on('drain', function(){console.log("buffer empty ")});
	   map[path]=writableStream;
 }

}

function appendToFileSync(path,data,callback){
fs.appendFileSync(path,data,encoding,errfunction);

}

function rollOverTheFileSync(path,timestamptoappend){
fs.renameSync(path,path+"."+timestamptoappend);
}
