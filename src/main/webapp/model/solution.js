exports.forUser = function forUser(userId, taskId, fn) {
  exports.mysql.query('SELECT * FROM solutions WHERE studentId = ? AND concreteTaskId = ? ORDER BY createdAt DESC', [userId, taskId], function(err, results) {
    if(err) {
      return fn(err);
    }
    fn(null, results[0]);
  });
};

exports.create = function create(userId, taskId, file, fn) {
  exports.mysql.query('INSERT INTO solutions (studentId, concreteTaskId, file, createdAt) VALUES (?, ?, ?, NOW())', [userId, taskId, file], fn);
};
