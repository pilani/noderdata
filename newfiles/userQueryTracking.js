
var mongoose = require('mongoose');
//var logging=require('./logging.js');
var http = require("http");

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(3001);

  
  mongoose.connect('mongodb://localhost/s3DB');

  var DB=mongoose.connection;
  DB.on('error',console.error.bind(console,'connection error'));
  DB.once('open', function callback(){

  	console.log("connection successfull");
    //logging.logInfo("connection successfull");

  });

var usrQuerySchema = mongoose.Schema({

Query                     :String
,UserID                   :String
,ResponseTime             :String
,Result                   :String
});

 var trackUsrQuery = mongoose.model('usrQuerySchema',usrQuerySchema);

function saveUserQuery(query,userID,responseTime,result){
    var trkUsrQry=new trackUsrQuery({});
    trkUsrQry.setValue("Query",query);
    trkUsrQry.setValue("UserID",userID);
    trkUsrQry.setValue("ResponseTime",responseTime);
    trkUsrQry.setValue("Result",result);

    trkUsrQry.save(function(err,result){

        if(err){
    
        console.log("ERROR in saving to mongo Db"+err);
    }
    else{
       console.log("RESULT" + result);
    }

    });
  }

function trackUserQuery(query,userID,responseTime,result){

saveUserQuery(query,userID,responseTime,result);

}