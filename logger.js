var winston = require('winston');
winston.add(winston.transports.File, { filename: 'rdata.log',maxsize:(1024*1000*10),maxFiles:10});
//winston.add(winston.transports.Console);
//winston.add(winston.transports.File, { filename: 'error.log' ,level:'error',maxsize:(1024*1000*10),maxFiles:20});
winston.loggers.add('bqimport', {
    console: {
     
    },
    file: {
      filename: 'bqimport.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });
winston.loggers.add('nomess', {
    console: {
     
    },
    file: {
      filename: 'nomess.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });





exports.logger=winston;
 /*exports.logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'rdata.log' })
      new (winston.transports.File)({ filename: 'error.log' ,level:'error'})
      new (winston.transports.File)({ filename: 'bquploader.log' ,level:'error'})

    ]
  });*/

/*test();

function test(){
winston.loggers.get('bqimport').info("www");
}*/
