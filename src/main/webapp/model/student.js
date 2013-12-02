exports.findById = function findById(id, fn) {
  exports.mysql.query('SELECT * FROM students WHERE id = ?', [id], function(err, results) {
    if(err) { return fn(err); }
    fn(null, results[0]);
  });
};

exports.all = function all(fn) {
  exports.mysql.query('SELECT * FROM students', fn);
};

exports.create = function create(opt, fn) {
  var crypto = require('crypto');
  var salt = crypto.createHash('sha1').update(''+Math.random()).digest('hex');
  var password = crypto.createHash('sha1').update(opt.neptun + ':' + salt).digest('hex') + ':' + salt;
  exports.mysql.query('INSERT INTO students (name, neptun, password) VALUES (?, ?, ?)', [opt.name, opt.neptun, password], fn);
};

exports.delete = function _delete(id, fn) {
  exports.mysql.query('DELETE FROM students WHERE id = ?', [id], fn);
};
