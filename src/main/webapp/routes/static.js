var fs = require('fs');

exports.js = function js(req, res) {
  fs.readFile('./js/' + req.param('file'), 'utf-8', function(err, data) {
    res.set('Content-Type', 'application/javascript');
    res.send(data);
  });
};

exports.css = function css(req, res) {
  fs.readFile('./css/style.css', 'utf-8', function(err, data) {
    res.set('Content-Type', 'text/css');
    res.send(data);
  });
};

exports.index = function index(req, res) {
  fs.readFile('./index.html', 'utf-8', function(err, data) {
    res.send(data);
  });
};
