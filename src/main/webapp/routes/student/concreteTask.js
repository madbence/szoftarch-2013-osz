var handle = require('..').errorHandler;
var model = require('../../model/');

exports.apply = function(req, res) {
  var _ = handle(req);
  _(model.concreteTask.apply)(req.user.id, req.param('id'), function() {
    res.json({
      ok: true
    });
  });
};

exports.deleteApplication = function(req, res) {
  var _ = handle(req);
  _(model.concreteTask.deleteApplication)(req.user.id, req.param('id'), function() {
    res.json({
      ok: true
    });
  });
};

exports.applied = function(req, res) {
  var _ = handle(req);
  _(model.concreteTask.applied)(req.user.id, function(tasks) {
    res.json(tasks);
  });
};
