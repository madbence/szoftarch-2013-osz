var model = require('../../model');
var Busboy = require('busboy');

exports.show = function show(req, res) {
  model.solution.forUser(req.user.id, req.param('id'), function(err, solution) {
    if(err) {
      return req.next(err);
    }
    res.json(solution);
  });
};

exports.create = function create(req, res) {
  var busboy = new Busboy({headers: req.headers});
  busboy.on('file', function(field, file, name, enc, mime) {
    model.solutions.create(req.user.id, req.param('id'), name, function(err, result) {  
      if(err) {
        return req.next(err);
      }
      var out = fs.createWriteStream('./solutions/' + result.insertId);
      file.on('data', function(data) {
        out.write(data);
      });
      file.on('end', function() {
        out.end();
        res.json({
          id: result.insertId,
          createdAt: new Date(),
          result: null,
          file: name
        });
      });
    });
  });
  req.pipe(busboy);
};
