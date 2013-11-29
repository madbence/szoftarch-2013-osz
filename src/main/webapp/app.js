/* jshint multistr: true */
var mysql = require('mysql').createConnection('mysql://root:root@localhost:3306/homeworkmanager');
var express = require('express');
var fs = require('fs');

var app = express();

//app.use(function(req, res, next) {
//  setTimeout(next, 2000);
//});

app.use(function(err, req, res, next) {
  console.error(err);
  res.json(500, {
    message: err.toString()
  });
});

app.get('/', function(req, res) {
  fs.readFile('./index.html', 'utf-8', function(err, data) {
    res.send(data);
  });
});

app.get('/js/:file', function(req, res) {
  fs.readFile('./js/' + req.param('file'), 'utf-8', function(err, data) {
    res.set('Content-Type', 'application/json');
    res.send(data);
  });
});

app.get('/css/style.css', function(req, res) {
  fs.readFile('./css/style.css', 'utf-8', function(err, data) {
    res.set('Content-Type', 'text/css');
    res.send(data);
  });
});

app.get('/api/student/tasks', function(req, res) {
  mysql.query('SELECT\
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
                 s.id = ?', [1], function(err, data) {
    if(err) {
      return req.next(err);
    }
    res.json(data);
  });
});

app.get('/api/student/concrete-tasks', function(req, res) {
  mysql.query('SELECT\
                 ct.id as id, \
                 ct.title as title, \
                 ct.description as description, \
                 ct.maxApplications as maxApplications, \
                 t.deadline as deadline, \
                 t.appDeadline as appDeadline, \
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
               HAVING applied > 0', [1, 1], function(err, data) {
    if(err) {
      return req.next(err);
    }
    res.json(data.map(function(c) {
      return {
        title: c.title,
        description: c.description,
        maxApplications: c.maxApplications,
        currentApplications: c.currentApplications,
        applied: !!c.applied,
        id: c.id,
        group: c.group,
        deadline: c.deadline,
        appDeadline: c.appDeadline
      };
    }));
  });
});

app.get('/api/student/tasks/:id', function(req, res) {
  mysql.query('SELECT\
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
                 s.id = ? AND t.id = ?', [1, req.param('id')], function(err, data) {
    if(err) {
      return req.next(err);
    }
    if(!data.length) {
      res.json(403, {
        message: 'Not allowed!'
      });
    }
    var task = data[0];
    mysql.query('SELECT\
                   ct.*,\
                   count(a.id) as currentApplications,\
                   sum(if(a.studentId = ?, 1, 0)) as applied\
                 FROM concreteTasks ct\
                   LEFT OUTER JOIN applications a ON a.concreteTaskId = ct.id\
                 WHERE ct.taskId = ?\
                 GROUP BY ct.id', [1, req.param('id')], function(err, data) {
      if(err) {
        req.next(err);
      }
      task.concreteTasks = data.map(function(c) {
        return {
          title: c.title,
          description: c.description,
          maxApplications: c.maxApplications,
          currentApplications: c.currentApplications,
          applied: !!c.applied,
          id: c.id,
          group: task.group,
          deadline: task.deadline,
          appDeadline: task.appDeadline
        };
      });
      res.json(task);
    });
  });
});

app.post('/api/student/concrete-tasks/:id', function(req, res) {
  mysql.query('INSERT INTO applications (studentId, concreteTaskId) VALUES (?, ?)', [1, req.param('id')], function(err) {
    if(err) {
      req.next(err);
    }
    res.json({
      ok: true
    });
  });
});

app.delete('/api/student/concrete-tasks/:id', function(req, res) {
  mysql.query('DELETE FROM applications WHERE studentId = ? AND concreteTaskId = ?', [1, req.param('id')], function(err) {
    if(err) {
      req.next(err);
    }
    res.json({
      ok: true
    });
  });
});

app.listen(8080);
