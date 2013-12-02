var handle = require('..').errorHandler;
var model = require('../../model/');

exports.index = function index(req, res) {
  var _ = handle(req);
  _(model.task.all)(function(data) {
    res.json(data);
  });
};

exports.create = function create(req, res) {
  var _ = handle(req);
  _(model.task.create)(req.body.title, req.body.description, req.body.deadline == '' ? null : req.body.deadline, req.body.appDeadline, req.user.id, req.body.group, function() {
    res.json({
      ok: true
    });
  });
};

exports.delete = function _delete(req, res) {
  var _ = handle(req);
  _(model.task.delete)(req.param('id'), function() {
    res.json({
      ok: true
    });
  });
};
