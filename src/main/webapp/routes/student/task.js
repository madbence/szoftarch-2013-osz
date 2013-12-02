var handle = require('..').errorHandler;
var model = require('../../model/');

exports.index = function index(req, res) {
  var _ = handle(req);
  _(model.task.forUser)(req.user.id, function(tasks) {
    res.json(tasks);
  });
};

exports.show = function(req, res) {
  var _ = handle(req);
  _(model.task.details)(req.user.id, req.param('id'), function(task) {
    return res.json(task);
  });
};
