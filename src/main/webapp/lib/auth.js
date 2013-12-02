var crypto = require('crypto');
var sessions = {};

exports.ensureStudent = function(req, res, next) {
  if(!req.headers['x-token'] || !sessions[req.headers['x-token']] || sessions[req.headers['x-token']].type !== 'student') {
    return res.json(403, {
      message: 'Please login!'
    });
  }
  sessions[req.headers['x-token']].lastAction = Date.now();
  req.user = sessions[req.headers['x-token']].user;
  next();
};

exports.ensureTeacher = function(req, res, next) {
  if(!req.headers['x-token'] || !sessions[req.headers['x-token']] || sessions[req.headers['x-token']].type !== 'teacher') {
    return res.json(403, {
      message: 'Please login!'
    });
  }
  sessions[req.headers['x-token']].lastAction = Date.now();
  req.user = sessions[req.headers['x-token']].user;
  next();
};

exports.login = function login(req, res) {
  exports.mysql.query('SELECT * FROM students WHERE neptun = ?', [req.body.username], function(err, result) {
    if(err) {
      return req.next(err);
    }
    if(result.length === 0) {
      return exports.mysql.query('SELECT * FROM teachers WHERE name = ?', [req.body.username], function(err, result) {
        if(err) {
          return req.next(err);
        }
        if(result.length === 0) {
          return res.json(403, { message: 'Not allowed' });
        }
        var hash = crypto.createHash('sha1');
        hash.update(req.body.password + ':' + result[0].password.split(':')[1]);
        var digest = hash.digest('hex');
        console.log(result[0].password, digest);
        if(digest !== result[0].password.split(':')[0]) {
          return res.json(403, { message: 'Not allowed' });
        }
        var sessionKey = crypto.createHash('sha1').update('' + Date.now() +  Math.random()).digest('hex');
        var session = {
          type: 'teacher',
          user: result[0],
          lastAction: Date.now(),
        };
        sessions[sessionKey] = session;
        res.json({
          token: sessionKey,
          type: 'teacher',
          username: result[0].name
        });
      });
    }
    var hash = crypto.createHash('sha1');
    hash.update(req.body.password + ':' + result[0].password.split(':')[1]);
    var digest = hash.digest('hex');
    console.log(result[0].password, digest);
    if(digest !== result[0].password.split(':')[0]) {
      return res.json(403, { message: 'Not allowed' });
    }
    var sessionKey = crypto.createHash('sha1').update('' + Date.now() +  Math.random()).digest('hex');
    var session = {
      type: 'student',
      user: result[0],
      lastAction: Date.now(),
    };
    sessions[sessionKey] = session;
    res.json({
      token: sessionKey,
      type: 'student',
      username: result[0].neptun
    });
  });
};

setInterval(function() {
  Object.keys(sessions).forEach(function(key) {
    if(sessions[key].lastAction + 1000*60*10 < Date.now()) {
      delete sessions[key];
    }
  });
}, 1000*60);
