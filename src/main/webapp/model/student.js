exports.findById = function findById(id, fn) {
  exports.mysql.query('SELECT id, name, neptun, email FROM students WHERE id = ?', [id], function(err, results) {
    if(err) { return fn(err); }
    fn(null, results[0]);
  });
};

exports.all = function all(fn) {
  exports.mysql.query('SELECT id, name, neptun, email FROM students', fn);
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

exports.findByConcreteTaskId = function findByConcreteTaskId(id, fn) {
  exports.mysql.query('SELECT s.id, s.name, s.neptun, s.email FROM students s LEFT JOIN applications a ON a.studentId = s.id WHERE a.concreteTaskId = ?', [id], fn);
};

exports.teacherDetails = function teacherDetails(id, fn) {
  exports.findById(id, function(err, student) {
    if(err) { return fn(err); }
    exports.mysql.query('SELECT\
          s.*, g.title as `group`, ct.title, ct.appDeadline\
        FROM solutions s\
          LEFT JOIN concreteTasks ct ON ct.id = s.concreteTaskId\
          LEFT JOIN tasks t on t.id = ct.taskId\
          LEFT JOIN groupTasks gt ON gt.taskId = t.id\
          LEFT JOIN `groups` g on g.id = gt.groupId\
        WHERE studentId = ? GROUP BY concreteTaskId ORDER BY id', [id], function(err, solutions) {
      if(err) { return fn(err); }
      student.solutions = solutions;
      fn(null, student);
    });
  });
};
