/* jshint multistr: true */
var model = require('./index');

exports.findById = function findById(id, fn) {
  exports.mysql.query('SELECT * FROM concreteTasks WHERE id = ?', [id], function(err, results) {
    if(err) {
      return fn(err);
    }
    return fn(null, results[0]);
  });
};

exports.teacherDetails = function teacherDetails(id, fn) {
  exports.mysql.query('SELECT ct.*, t.title as taskTitle FROM concreteTasks ct LEFT JOIN tasks t on t.id = ct.taskId WHERE ct.id = ?', [id], function(err, res) {
    if(err) {
      return fn(err);
    }
    model.student.findByConcreteTaskId(id, function(err, students) {
      if(err) {
        return fn(err);
      }
      res[0].applications = students.length;
      res[0].students = students;
      fn(null, res[0]);
    });
  });
};

exports.findByTaskId = function findByTaskId(taskId, fn) {
  exports.mysql.query('SELECT * FROM concreteTasks WHERE taskId = ?', [taskId], fn);
};

exports.create = function create(title, description, maxApplications, taskId, teacherId, deadline, appDeadline, fn) {
  exports.mysql.query('INSERT INTO concreteTasks (title, description, maxApplications, taskId, teacherId, deadline, appDeadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, maxApplications, taskId, teacherId, deadline, appDeadline], fn);
};

exports.update = function update(id, title, description, maxApplications, taskId, teacherId, fn) {
  exports.mysql.query('UPDATE concreteTasks SET title = ?, description = ?, maxApplications = ?, taskId = ?, teacherId = ? WHERE id = ?', [title, description, maxApplications, taskId, teacherId, id], fn);
};


exports.all = function(fn) {
  exports.mysql.query('SELECT * FROM concreteTasks', fn);
};

exports.delete = function _delete(id, fn) {
  exports.mysql.query('DELETE FROM concreteTasks WHERE id = ?', [id], fn);
};

exports.forTask = function forTask(userId, taskId, fn) {
  exports.mysql.query(
    'SELECT\
       ct.*,\
       t.deadline, t.appDeadline,\
       count(a.id) as currentApplications,\
       sum(if(a.studentId = ?, 1, 0)) as applied\
     FROM concreteTasks ct\
       LEFT JOIN tasks t ON t.id = ct.taskId\
       LEFT OUTER JOIN applications a ON a.concreteTaskId = ct.id\
     WHERE ct.taskId = ?\
     GROUP BY ct.id', [userId, taskId], function(err, data) {
    if(err) {
      return fn(err);
    }
    fn(null, data);
  });
};

exports.applied = function applied(userId, fn) {
  exports.mysql.query('SELECT\
                 ct.id as id, \
                 ct.title as title, \
                 ct.description as description, \
                 ct.maxApplications as maxApplications, \
                 ct.deadline as deadline, \
                 ct.appDeadline as appDeadline, \
                 g.title as `group`, \
                 count(a.id) as currentApplications, \
                 sum(if(a.studentId = ?, 1, 0)) as applied \
               FROM students s \
                 LEFT JOIN groupStudents gs ON gs.studentId = s.id \
                 LEFT JOIN groups g ON g.id = gs.groupId \
                 LEFT JOIN groupTasks gt on gt.groupId = g.id \
                 LEFT JOIN tasks t ON t.id = gt.taskId \
                 LEFT JOIN concreteTasks ct ON ct.taskId = t.id \
                 LEFT JOIN applications a ON a.concreteTaskId = ct.id \
               WHERE \
                 s.id = ? \
               GROUP BY ct.id \
               HAVING applied > 0', [userId, userId], function(err, data) {
    if(err) {
      return fn(err);
    }
    fn(null, data);
  });
};

exports.canApply = function canApply(userId, taskId, fn) {
  exports.mysql.query('SELECT count(*) as c FROM applications WHERE studentId = ? AND concreteTaskId = ?', [userId, taskId], function(err, res) {
    if(err) {
      fn(err);
    }
    fn(err, !res[0].c);
  });
};

exports.apply = function apply(userId, taskId, fn) {
  exports.mysql.query('INSERT INTO applications (studentId, concreteTaskId) VALUES (?, ?)', [userId, taskId], fn);
};

exports.deleteApplication = function deleteApplication(userId, taskId, fn) {
  exports.mysql.query('DELETE FROM applications WHERE studentId = ? AND concreteTaskId = ?', [userId, taskId], fn);
};
