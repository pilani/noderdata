amqp = require('amqp');

var name = "test";
console.log("exchange: " + name);



connection = amqp.createConnection({ host: '10.120.10.33' });

connection.addListener('error', function (e) {
  throw e;
});

connection.addListener('ready', function () {
  console.log("Connected");
  var q = connection.queue(name);
  q.destroy().addCallback(function () {
    console.log('queue destroyed.');
    connection.close();
  });
});
