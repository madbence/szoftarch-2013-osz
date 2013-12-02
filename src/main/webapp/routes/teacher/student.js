var handle = require('..').errorHandler;
var model = require('../../model/');

exports.index = function index(req, res) {
  var _ = handle(req);
  _(model.student.all)(function(data) {
    res.json(data);
  });
};

exports.create = function create(req, res) {
  var _ = handle(req);
  _(model.student.create)(req.body, function(data) {
    res.json({
      id: data.insertId
    });
  });
};

exports.delete = function _delete(req, res) {
  var _ = handle(req);
  _(model.student.delete)(req.param('id'), function() {
    res.json({
      ok: true
    });
  });
};
