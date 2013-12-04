exports.all = function all(fn) {
  exports.mysql.query('SELECT * FROM groups', fn);
};

exports.create = function create(opt, fn) {
  exports.mysql.query('INSERT INTO groups (title) VALUES(?)', [opt.name], fn);
};

exports.delete = function _delete(id, fn) {
  exports.mysql.query('DELETE FROM groups WHERE id = ?', [id], fn);
};

exports.findByTaskId = function findByTaskId(id, fn) {
  exports.mysql.query('SELECT g.* FROM groups g LEFT JOIN groupTasks gt ON gt.groupId = g.id WHERE gt.taskId = ?', [id], fn);
};

exports.teacherDetails = function teacherDetails(id, fn) {
  exports.mysql.query('SELECT * FROM groups WHERE id = ?', [id], function(err, group) {
    if(err) { return fn(err); }
    group = group[0];
    if(!group) {
      return fn('not found');
    }
    exports.mysql.query('SELECT s.name, s.neptun, s.id, s.email FROM students s LEFT JOIN groupStudents gs ON gs.studentId = s.id LEFT JOIN groups g ON g.id = gs.groupId WHERE g.id = ?', [id], function(err, students) {
      if(err) { return fn(err); }
      group.members = students.length;
      group.students = students;
      fn(null, group);
    });
  });
};

exports.addStudent = function addStudent(gid, sid, fn) {
  exports.mysql.query('INSERT INTO groupStudents (groupId, studentId) VALUES (?, ?)', [gid, sid], fn);
};

exports.removeStudent = function removeStudent(gid, sid, fn) {
  exports.mysql.query('DELETE FROM groupStudents WHERE groupId = ? AND studentId = ?', [gid, sid], fn);
};
