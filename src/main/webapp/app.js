/* jshint multistr: true */
var mysql = require('mysql').createConnection('mysql://root:root@localhost:3306/homeworkmanager');
var express = require('express');
var fs = require('fs');
var crypto = require('crypto');
var https = require('https');
var Busboy = require('busboy');

var pk = fs.readFileSync('./privatekey.pem').toString();
var cert = fs.readFileSync('./certificate.pem').toString();
var credentials = crypto.createCredentials({key: pk, cert: cert});

var auth = require('./lib/auth');
auth.mysql = mysql;

/** MODELS */
var model = require('./model');
Object.keys(model).forEach(function(key) {
  model[key].mysql = mysql;
});

/** ROUTES */
var staticRoute = require('./routes/static');
var studentTaskRoute = require('./routes/student/task');
var studentConcreteTaskRoute = require('./routes/student/concreteTask');
var studentSolutionRoute = require('./routes/student/solution');
var teacherTaskRoute = require('./routes/teacher/task');
var teacherConcreteTaskRoute = require('./routes/teacher/concreteTask');
var teacherGroupRoute = require('./routes/teacher/group');
var teacherStudentRoute = require('./routes/teacher/student');

var app = express();

app.use(express.json());

app.use(function(err, req, res, next) {
  console.error(err);
  res.json(500, {
    message: err.toString()
  });
});

app.get('/', staticRoute.index);
app.get('/js/:file', staticRoute.js);
app.get('/css/style.css', staticRoute.css);

app.post('/api/login', auth.login);
app.all('/api/student/*', auth.ensureStudent);
app.all('/api/teacher/*', auth.ensureTeacher);

/** STUDENT ROUTES */
app.get('/api/student/tasks', studentTaskRoute.index);
app.get('/api/student/tasks/:id', studentTaskRoute.show);
app.post('/api/student/concrete-tasks/:id', studentConcreteTaskRoute.apply);
app.delete('/api/student/concrete-tasks/:id', studentConcreteTaskRoute.deleteApplication);
app.get('/api/student/concrete-tasks', studentConcreteTaskRoute.applied);
app.get('/api/student/concrete-tasks/:id/solution', studentSolutionRoute.show);
app.post('/api/student/concrete-tasks/:id/solution', studentSolutionRoute.create);

/** TEACHER ROUTES */
app.get('/api/teacher/groups', teacherGroupRoute.index);
app.get('/api/teacher/students', teacherStudentRoute.index);

app.post('/api/teacher/students', teacherStudentRoute.create);
app.get('/api/teacher/students/:id', teacherStudentRoute.show);
app.delete('/api/teacher/students/:id', teacherStudentRoute.delete);

app.post('/api/teacher/groups', teacherGroupRoute.create);
app.get('/api/teacher/groups/:id', teacherGroupRoute.show);
app.delete('/api/teacher/groups/:id', teacherGroupRoute.delete);
app.post('/api/teacher/groups/:id/students', teacherGroupRoute.addStudent);
app.delete('/api/teacher/groups/:id/students/:sid', teacherGroupRoute.removeStudent);

app.get('/api/teacher/tasks', teacherTaskRoute.index);
app.post('/api/teacher/tasks', teacherTaskRoute.create);
app.get('/api/teacher/tasks/:id', teacherTaskRoute.show);
app.delete('/api/teacher/tasks/:id', teacherTaskRoute.delete);
app.post('/api/teacher/tasks/:id/groups', teacherTaskRoute.addGroup);
app.delete('/api/teacher/tasks/:id/groups/:gid', teacherTaskRoute.removeGroup);

app.get('/api/teacher/concrete-tasks', teacherConcreteTaskRoute.index);
app.post('/api/teacher/concrete-tasks', teacherConcreteTaskRoute.create);
app.get('/api/teacher/concrete-tasks/:id', teacherConcreteTaskRoute.show);
app.delete('/api/teacher/concrete-tasks/:id', teacherConcreteTaskRoute.delete);
app.post('/api/teacher/concrete-tasks/:id/students', teacherConcreteTaskRoute.addStudent);
app.delete('/api/teacher/concrete-tasks/:id/students/:sid', teacherConcreteTaskRoute.removeStudent);

app.put('/api/teacher/solutions/:id', function(req, res) {
  mysql.query('UPDATE solutions SET result = ?, `comment` = ? WHERE id = ?', [req.body.grade, req.body.comment, req.param('id')], function(err) {
    console.log(err, req.body);
    res.json({
      ok: true
    });
  });
});

app.get('/solutions/:id', function(req, res) {
  res.send(fs.readFileSync('./solutions/' + req.param('id')));
});

app.get('*', staticRoute.index);

var server = https.createServer({key: pk, cert: cert}, app);
server.listen(443);

process.on('uncaughtException', function(e) {
  console.error(e);
});
