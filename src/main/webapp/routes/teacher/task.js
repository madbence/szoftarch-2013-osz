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
  _(model.task.create)(
      req.body.title,
      req.body.description,
      req.user.id, function() {
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

exports.show = function show(req, res) {
  var _ = handle(req);
  _(model.task.teacherDetails)(req.param('id'), function(data) {
    res.json(data);
  });
};

exports.addGroup = function addGroup(req, res) {
  var _ = handle(req);
  var tid = req.param('id');
  var gid = req.body.id;
  _(model.task.hasGroup)(tid, gid, function(has) {
    if(has) {
      return res.json(403, { message: 'Group already added!' });
    }
    _(model.task.addGroup)(tid, gid, function() {
      res.json({ ok: true});
    });
  });
};

exports.removeGroup = function removeGroup(req, res) {
  var _ = handle(req);
  var tid = req.param('id');
  var gid = req.param('gid');
  _(model.task.hasGroup)(tid, gid, function(has) {
    if(!has) {
      return res.json(403, { message: 'Cannot remove, already removed!' });
    }
    _(model.task.removeGroup)(tid, gid, function() {
      res.json({ ok: true});
    });
  });
};
