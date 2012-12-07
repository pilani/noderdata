var fproperties  = function fproperties(){

	var map = new Object();

	this.getFileStartTime=function(qname){
	return map[qname];
	}

	this.setFileStartTime=function(qname,time){
	map[qname]=time;
	}

   if(fproperties.caller != fproperties.getInstance){
        throw new Error("This object cannot be instantiated");

    }

}

fproperties.instance=null;

fproperties.getInstance = function(){
	if(this.instance==null){
             instance=new fproperties();
	}
	return instance;
}

module.exports=fproperties.getInstance();


