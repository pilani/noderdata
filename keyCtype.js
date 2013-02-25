var keys = require('./keys.js').keys;
var columns = require('./columns.js').columns;
var ctype = require('./columnstype.js').ctype;
var ckmap = require('./columnkeymapping.js').ckmap;

var kctype = new Object();//
test();


function test(){
for( var i in keys){
	//console.log("key "+keys[i]);
	var col ;
	for(var j in ckmap){
		if(ckmap[j]==keys[i]){
			col = j;
			break;
		}

		
	}
	var cty ;
	if(ctype[col]=="float"){
		cty="NUMBER";
	}
	if(ctype[col]=="string"){
		cty="STRING";
	}
	if(ctype[col]=="integer"){
		cty="NUMBER";
	}
	if(ctype[col]=="boolean"){
		cty="BOOLEAN";
	}

	//console.log(keys[i]+"  "+cty+",");
	kctype[keys[i]] = cty;

	//console.log("column "+ckmap[keys[i]] );
}

exports.kctype = kctype;
}


