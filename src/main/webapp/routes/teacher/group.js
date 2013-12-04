var handle = require('..').errorHandler;
var model = require('../../model/');

exports.index = function index(req, res) {
  var _ = handle(req);
  _(model.group.all)(function(data) {
    res.json(data);
  });
};

exports.create = function create(req, res) {
  var _ = handle(req);
  _(model.group.create)(req.body, function(data) {
    res.json({
      id: data.insertId
    });
  });
};

exports.delete = function _delete(req, res) {
  var _ = handle(req);
  _(model.group.delete)(req.param('id'), function() {
    res.json({
      ok: true
    });
  });
};

exports.show = function show(req, res) {
  var _ = handle(req);
  _(model.group.teacherDetails)(req.param('id'), function(data) {
    res.json(data);
  }); 
};

exports.addStudent = function addStudent(req, res) {
  var _ = handle(req);
  _(model.group.addStudent)(req.param('id'), req.body.id, function() {
    res.json({
      ok: true
    });
  });
};

exports.removeStudent = function removeStudent(req, res) {
  var _ = handle(req);
  _(model.group.removeStudent)(req.param('id'), req.param('sid'), function() {
    res.json({
      ok: true
    });
  });
};
