/* jshint multistr: true */

var async = require('async');
var model = require('./index');

exports.findById = function findById(id, fn) {
  exports.mysql.query(
      'SELECT\
        t.*,\
        count(distinct ct.id) as subtasks,\
        count(distinct gt.id) as groups\
      FROM tasks t\
        LEFT OUTER JOIN concreteTasks ct on ct.taskId = t.id\
        LEFT OUTER JOIN groupTasks gt on gt.taskId = t.id\
      WHERE t.id = ?', [id], function(err, results) {
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

exports.details = function details(sid, tid, fn) {
  exports.findById(tid, function(err, task) {
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
                 s.id = ? AND t.id = ? \
               GROUP BY ct.id', [sid, sid, tid], function(err, data) {
                 if(err) { return fn(err); }
                 task.concreteTasks = data;
                 fn(null, task);
               });
  });
  /*exports.forUser(userId, function(err, data) {
    if(err) { return fn(err); }
    var task = data[0];
    exports.mysql.query('SELECT\
      ct.*,
  }*/
}

exports.teacherDetails = function teacherDetails(taskId, fn) {
  async.parallel({
    task: exports.findById.bind(null, taskId),
    concreteTasks: model.concreteTask.findByTaskId.bind(null, taskId),
    groups: model.group.findByTaskId.bind(null, taskId)
  }, function(err, results) {
    if(err) {
      return fn(err);
    }
    results.task.concreteTasks = results.concreteTasks[0];
    results.task.inGroups = results.groups[0];
    fn(null, results.task);
  });
};

exports.create = function create(title, description, teacherId, fn) {
  exports.mysql.query('INSERT INTO tasks (title, description, teacherId) VALUES (?, ?, ?)',
      [title, description, teacherId], function(err, result) {
    if(err) {
      return fn(err);
    }
    fn(err, result);
  });
};

exports.delete = function _delete(id, fn) {
  exports.mysql.query('DELETE FROM tasks WHERE id = ?', [id], fn);
};

exports.addGroup = function addToGroup(tid, gid, fn) {
  exports.mysql.query('INSERT INTO groupTasks (taskId, groupId) VALUES (?, ?)', [tid, gid], fn);
};

exports.removeGroup = function removeFromGroup(tid, gid, fn) {
  exports.mysql.query('DELETE FROM groupTasks WHERE taskId = ? AND groupId = ?', [tid, gid], fn);
};

exports.hasGroup = function hasGroup(tid, gid, fn) {
  exports.mysql.query('SELECT count(*) as c from groupTasks WHERE taskId = ? AND groupId = ?', [tid, gid], function(err, result) {
    if(err) { return fn(err); }
    fn(null, !!result[0].c);
  });
};

exports.all = function all(fn) {
  exports.mysql.query(
    'SELECT\
      t.*,\
      count(distinct ct.id) as subtasks,\
      count(distinct gt.id) as groups\
    FROM tasks t\
      LEFT OUTER JOIN concreteTasks ct on ct.taskId = t.id\
      LEFT OUTER JOIN groupTasks gt on gt.taskId = t.id\
    GROUP BY t.id', fn);
};
