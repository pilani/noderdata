
/*
 * GET home page.
 */

exports.bqhome = function(req, res){
  res.render('bqhome', { title: 'Imports Pending Files' })
};

exports.impff = function(req, res){
  res.render('impff', { title: 'Imports Failed Files' })
};

exports.rmqhcs = function(req, res){
  res.render('rmqhcs', { title: 'RabbitMQ Health Stats' })
};
