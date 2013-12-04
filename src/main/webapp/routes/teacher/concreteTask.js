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
  if(req.body.deadline === '') {
    req.body.deadline = null;
  }
  _(model.concreteTask.create)(req.body.title, req.body.description, req.body.maxApplications, req.body.task, req.user.id, req.body.deadline, req.body.appDeadline, function(data) {
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

exports.show = function show(req, res) {
  var _ = handle(req);
  _(model.concreteTask.teacherDetails)(req.param('id'), function(data) {
    res.json(data);
  });
};

exports.addStudent = function addStudent(req, res) {
  var _ = handle(req);
  _(model.concreteTask.canApply)(req.body.id, req.param('id'), function(can) {
    if(!can) {
      return res.json(403, { message: 'Cannot apply!' });
    }
    _(model.concreteTask.apply)(req.body.id, req.param('id'), function() {
      res.json({ok: true});
    });
  });
};

exports.removeStudent = function removeStudent(req, res) {
  var _ = handle(req);
  _(model.concreteTask.deleteApplication)(req.param('sid'), req.param('id'), function() {
    res.json({ok: true});
  });
};
