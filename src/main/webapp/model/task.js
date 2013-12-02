/* jshint multistr: true */

var model = require('./index');

exports.findById = function findById(id, fn) {
  exports.mysql.query('SELECT * FROM tasks WHERE id = ?', [id], function(err, results) {
    if(err) {
      return fn(err);
    }
    fn(null, results[0]);
  });
};

exports.forUser = function forUser(userId, fn) {
  exports.mysql.query(
  'SELECT\
    t.id as id, \
    t.title as title, \
    t.description as description, \
    t.deadline as deadline, \
    t.appDeadline as appDeadline, \
    g.title as `group` \
  FROM students s \
    LEFT JOIN groupStudents gs ON gs.studentId = s.id \
    LEFT JOIN groups g ON g.id = gs.groupId \
    LEFT JOIN groupTasks gt on gt.groupId = g.id \
    LEFT JOIN tasks t ON t.id = gt.taskId \
  WHERE \
    s.id = ?', [userId], function(err, data) {
    if(err) {
      return fn(err);
    }
    fn(null, data);
  });
};

exports.details = function details(userId, taskId, fn) {
  exports.findById(taskId, function(err, task) {
    if(err) {
      return fn(err);
    }
    model.concreteTask.forTask(userId, taskId, function(err, concreteTasks) {
      if(err) {
        return fn(err);
      }
      task.concreteTasks = concreteTasks;
      fn(null, task);
    });
  });
};

exports.create = function create(title, description, deadline, appDeadline, teacherId, group, fn) {
  exports.mysql.query('INSERT INTO tasks (title, description, deadline, appDeadline, teacherId) VALUES (?, ?, ?, ?, ?)',
      [title, description, deadline, appDeadline, teacherId], function(err, result) {
    if(err) {
      return fn(err);
    }
    if(group) {
      return exports.mysql.query('INSERT INTO groupTasks (groupId, taskId) VALUES (?, ?)', [group, result.insertId], fn);
    }
    fn(err, result);
  });
};

exports.delete = function _delete(id, fn) {
  exports.mysql.query('DELETE FROM tasks WHERE id = ?', [id], fn);
};

exports.addToGroup = function addToGroup(tid, gid, fn) {
  exports.mysql.query('INSERT INTO groupTasks (taskId, groupId) VALUES (?, ?)', [tid, gid], fn);
};

exports.removeFromGroup = function removeFromGroup(tid, gid, fn) {
  exports.mysql.query('DELETE FROM groupTasks WHERE taskId = ? AND groupId = ?', [tid, gid], fn);
};

exports.all = function all(fn) {
  exports.mysql.query('SELECT * FROM tasks', fn);
};
