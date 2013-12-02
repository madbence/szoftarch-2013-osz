var handle = require('..').errorHandler;
var model = require('../../model/');

exports.index = function index(req, res) {
  var _ = handle(req);
  _(model.concreteTask.all)(function(data) {
    res.json(data);
  });
};

exports.create = function create(req, res) {
  var _ = handle(req);
  _(model.concreteTask.create)(req.body.title, req.body.description, req.body.maxApplications, req.body.task, req.user.id, function(data) {
    res.json({
      id: data.insertId
    });
  });
};

exports.delete = function _delete(req, res) {
  var _ = handle(req);
  _(model.concreteTask.delete)(req.param('id'), function() {
    res.json({
      ok: true
    });
  });
};
