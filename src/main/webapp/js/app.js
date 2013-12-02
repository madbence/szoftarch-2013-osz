/* jshint boss: true */

/**
 * @title Foobar
 * @author Bence Dányi
 */


var LoginView = BaseView.extend({
  templateSelector: '#login-tpl',
  events: {
    'click #login-btn': 'login'
  },
  login: function() {
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/api/login',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        username: this.el.querySelector('#login-name').value,
        password: this.el.querySelector('#login-password').value
      }),
      success: function(result) {
        self.trigger('login', result.type, result.token, result.username);
      },
      error: function() {
        self.el.querySelector('#login-error').style.display = 'block';
      }
    });
  }
});

var TeacherApplicationView = BaseView.extend({
  templateSelector: '#teacher-dashboard',
  events: {
    'click a': function(e) {
      e.preventDefault();
      window.appRouter.navigate(e.currentTarget.pathname.substr(1), {trigger: true});
    }
  },
  initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.update();
  },
  setTab: function(name) {
    if(this._name === name) {
      return;
    } else if(name === 'tasks') {
      this.activeView = new TeacherTasksView({
        collection: this.model.tasks
      });
      this.model.loadTasks();
    } else if(name === 'concrete-tasks') {
      this.activeView = new TeacherConcreteTasksView({
        collection: this.model.concreteTasks
      });
      this.model.loadConcreteTasks();
    } else if(name === 'groups') {
      this.activeView = new TeacherGroupsView({
        collection: this.model.groups
      });
      this.model.loadGroups();
    } else if(name === 'students') {
      this.activeView = new TeacherStudentsView({
        collection: this.model.students
      });
      this.model.loadStudents();
    } else {
      return;
    }
    this._name = name;
    this.update();
  },
  update: function() {
    if(!this.activeView) return;
    [].forEach.call(this.el.querySelectorAll('nav a'), function(el) {
      el.classList.remove('active');
    });
    this.el.querySelector('#nav-' + this._name) && this.el.querySelector('#nav-' + this._name).classList.add('active');
    var container = this.el.querySelector('#subview-container');
    if(container.childNodes.length === 0) {
      container.appendChild(this.activeView.el);
    } else if(container.childNodes[0] !== this.activeView.el) {
      container.removeChild(container.childNodes[0]);
      container.appendChild(this.activeView.el);
    }
  },
});

var TeacherApplication = Backbone.Model.extend({
  initialize: function() {
    this.tasks = new Backbone.Collection();
    this.concreteTasks = new Backbone.Collection();
    this.students = new Backbone.Collection();
    this.groups = new Backbone.Collection();
    var self = this;
    self.ajax = {};
    ['get', 'post', 'delete', 'put'].forEach(function(method) {
      self.ajax[method] = function(url, data, fn, err) {
        $.ajax({
          type: method,
          url: url,
          dataType: 'json',
          contentType: 'application/json',
          data: data ? JSON.stringify(data) : null,
          headers: {
            'X-Token': self.get('token')
          },
          success: fn,
          error: err
        });
      };
    });
  },
  loadConcreteTasks: function() {
    if(this.concreteTasks._loaded) {
      return;
    }
    var self = this;
    this.ajax.get('/api/teacher/concrete-tasks', null, function(data) {
      self.concreteTasks.add(data.map(function(d) {
        return new ConcreteTask(d);
      }));
      self.concreteTasks._loaded = true;
    });
  },
  loadTasks: function() {
    if(this.tasks._loaded) {
      return;
    }
    var self = this;
    this.ajax.get('/api/teacher/tasks', null, function(data) {
      self.tasks.add(data.map(function(d) {
        return new Task(d);
      }));
      self.tasks._loaded = true;
    });
  },
  loadStudents: function() {
    if(this.students._loaded) {
      return;
    }
    var self = this;
    this.ajax.get('/api/teacher/students', null, function(data) {
      self.students.add(data.map(function(d) {
        return new Backbone.Model(d);
      }));
      self.students._loaded = true;
    });
  },
  loadGroups: function() {
    if(this.groups._loaded) {
      return;
    }
    var self = this;
    this.ajax.get('/api/teacher/groups', null, function(data) {
      self.groups.add(data.map(function(d) {
        return new Backbone.Model(d);
      }));
      self.groups._loaded = true;
    });
  },
  createStudent: function(opt) {
    var self = this;
    this.ajax.post('/api/teacher/students', opt, function(data) {
      self.students._loaded = false;
      window.appRouter.navigate('/teacher/students', { trigger: true });
    });
  },
  createGroup: function(opt) {
    var self = this;
    this.ajax.post('/api/teacher/groups', opt, function(data) {
      self.groups._loaded = false;
      window.appRouter.navigate('/teacher/groups', { trigger: true });
    });
  },
  createConcreteTask: function(opt) {
    var self = this;
    this.ajax.post('/api/teacher/concrete-tasks', opt, function(data) {
      self.concreteTasks._loaded = false;
      window.appRouter.navigate('/teacher/concrete-tasks', { trigger: true });
    });
  },
  createTask: function(opt) {
    var self = this;
    this.ajax.post('/api/teacher/tasks', opt, function(data) {
      self.tasks._loaded = false;
      window.appRouter.navigate('/teacher/tasks', { trigger: true });
    });
  },
  deleteStudent: function(id) {
    var self = this;
    this.ajax.delete('/api/teacher/students/' + id, null, function() {
      self.students.remove(id);
      window.appRouter.navigate('/teacher/students', { trigger: true });
    });
  },
  deleteGroup: function(id) {
    var self = this;
    this.ajax.delete('/api/teacher/groups/' + id, null, function() {
      self.groups.remove(id);
      window.appRouter.navigate('/teacher/groups', { trigger: true });
    });
  }
});

var TeacherStudentItemView = BaseView.extend({
  templateSelector: '#teacher-student-item',
  className: 'task',
  events: {
    'click .delete': 'delete',
  },
  'delete': function() {
    window.application.deleteStudent(this.model.get('id'));
  }
});
var TeacherStudentsView = CollectionView.extend({
  templateSelector: '#teacher-students',
  containerSelector: '#students',
  emptyListView: EmptyListItemView,
  childViewClass: TeacherStudentItemView,
  events: {
    'click #new-student': 'create',
  },
  create: function() {
    window.appRouter.navigate('teacher/students/new', {trigger: true});
  }
});
var TeacherStudentView = BaseView.extend({
  templateSelector: '#teacher-rate',
  initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    var self = this;
    $.ajax({
      url: '/api/teacher/students/' + this.model.get('id') + '/solutions',
      dataType: 'json',
          headers: {
            'X-Token': window.application.get('token')
          },
      success: function(data) {
        self.el.querySelector('ul').innerHTML=data.map(function(d) {
          return '<li><a href="/solutions/' + d.id +'">' + d.file + '</a> <input id="rate-' + d.id +'"><button data-id="' + d.id +'">ok</button></li>';
        }).join('');
      }
    });
  },
  events: {
    'click button': 'save'
  },
  save: function(e) {
    $.ajax({
      type: 'put',
          headers: {
            'X-Token': window.application.get('token')
          },
      data: JSON.stringify({results: document.getElementById('rate-' + e.currentTarget.dataset['id']).value}),
      contentType: 'application/json',
      url: '/api/teacher/students/' + this.model.get('id') + '/solutions/' + e.currentTarget.dataset['id']
    });
  }
});

var TeacherStudentCreateView = BaseView.extend({
  templateSelector: '#teacher-student-new',
  events: {
    'click .create': 'create',
  },
  create: function() {
    window.application.createStudent({
      name: this.el.querySelector('#name').value,
      neptun: this.el.querySelector('#neptun').value
    });
  }
});

var TeacherGroupItemView = BaseView.extend({
  templateSelector: '#teacher-group-item',
  className: 'task',
  events: {
    'click .delete': 'delete',
  },
  'delete': function() {
    window.application.deleteGroup(this.model.get('id'));
  }
});
var TeacherGroupsView = CollectionView.extend({
  templateSelector: '#teacher-groups',
  containerSelector: '#groups',
  emptyListView: EmptyListItemView,
  childViewClass: TeacherGroupItemView,
  events: {
    'click #new-group': 'create',
  },
  create: function() {
    window.appRouter.navigate('teacher/groups/new', {trigger:true});
  }
});
var TeacherGroupView = BaseView.extend({});
var TeacherGroupCreateView = BaseView.extend({
  templateSelector: '#teacher-group-new',
  events: {
    'click .create': 'create',
  },
  create: function() {
    window.application.createGroup({
      name: this.el.querySelector('#name').value,
    });
  }
});

var TeacherTaskCreateView = BaseView.extend({
  templateSelector: '#teacher-task-new',
  initialize: function(opt) {
    BaseView.prototype.initialize.apply(this, arguments);
    window.application.loadGroups();
    var self = this;
    setTimeout(function() {
      self.el.querySelector('select').innerHTML = window.application.groups.map(function(g) {
        return '<option value="' + g.get('id') + '">' + g.get('title') + '</option>';
      });
    }, 1000);
  },
  events: {
    'click .create': 'create',
  },
  create: function() {
    window.application.createTask({
      title: this.el.querySelector('#title').value,
      description: this.el.querySelector('#description').value,
      deadline: this.el.querySelector('#deadline').value,
      applicationDeadline: this.el.querySelector('#appDeadline').value,
      group: this.el.querySelector('select').value
    });
  }
});

var TeacherConcreteTaskItemView = BaseView.extend({
  templateSelector: '#teacher-concrete-task-item',
  className: 'task',
});
var TeacherConcreteTasksView = CollectionView.extend({
  templateSelector: '#teacher-concrete-tasks',
  containerSelector: '#concrete-tasks',
  emptyListView: EmptyListItemView,
  childViewClass: TeacherConcreteTaskItemView,
  events: {
    'click #new-concrete-task': 'create',
  },
  create: function() {
    window.appRouter.navigate('teacher/concrete-tasks/new', {trigger:true});
  }
});
var TeacherConcreteTaskView = BaseView.extend({});
var TeacherConcreteTaskCreateView = BaseView.extend({
  templateSelector: '#teacher-concrete-task-new',
  initialize: function(opt) {
    BaseView.prototype.initialize.apply(this, arguments);
    window.application.loadTasks();
    window.application.loadStudents();
    var self = this;
    setTimeout(function() {
      self.el.querySelector('select#task-list').innerHTML = window.application.tasks.map(function(g) {
        return '<option value="' + g.get('id') + '">' + g.get('title') + '</option>';
      });
    }, 1000);
  },
  events: {
    'click .create': 'create',
  },
  create: function() {
    window.application.createConcreteTask({
      title: this.el.querySelector('#title').value,
      description: this.el.querySelector('#description').value,
      maxApplications: this.el.querySelector('#maxApplications').value,
      task: this.el.querySelector('select').value
    });
  }
});
var TeacherTaskItemView = BaseView.extend({
  templateSelector: '#teacher-task-item',
  className: 'task',
  events: {
    'click': 'showTask',
    'click .delete': 'delete',
  },
  showTask: function(e) {
    e.preventDefault();
    window.appRouter.navigate('teacher/tasks/' + this.model.get('id'), {trigger: true});
  },
  'delete': function() { alert('DELETE'); }
});

var TeacherTasksView = CollectionView.extend({
  templateSelector: '#teacher-tasks',
  containerSelector: '#tasks',
  emptyListView: EmptyListItemView,
  childViewClass: TeacherTaskItemView,
  events: {
    'click #new-task': 'create',
  },
  create: function() {
    window.appRouter.navigate('teacher/tasks/new', {trigger:true});
  }
});

var TeacherTaskView = CollectionView.extend({
  templateSelector: '#teacher-task',
  containerSelector: '#concrete-tasks',
  emptyListView: EmptyListItemView,
  childViewClass: TeacherConcreteTaskItemView,
  initialize: function() {
    var self = this;
    this.collection = this.model.concreteTasks;
    CollectionView.prototype.initialize.apply(this, arguments);
    window.application.loadAbstractTask(this.model.get('id'));
  }
});

var RateView = BaseView.extend({});


var ConcreteTask = Backbone.Model.extend({
  initialize: function(data) {
    this.set('isoDeadline', data.deadline);
    this.set('deadline', new Date(data.deadline));
    this.set('isoAppDeadline', data.addDeadline);
    this.set('appDeadline', new Date(data.appDeadline));
  },
  toJSON: function() {
    var base = {};
    Object.keys(this.attributes).forEach(function(attr) {
      base[attr] = this.attributes[attr];
    }, this);
    base.deadline = base.deadline.toLocaleString();
    base.appDeadline = base.appDeadline.toLocaleString();
    return base;
  },
  toggleApplication: function() {
    if(this.get('applied')) {
      window.application.removeTask(this);
    } else {
      window.application.addTask(this);
    }
  }
});

var Task = Backbone.Model.extend({
  initialize: function(data) {
    this.set('isoDeadline', data.deadline);
    this.set('deadline', new Date(data.deadline));
    this.set('isoAppDeadline', data.addDeadline);
    this.set('appDeadline', new Date(data.appDeadline));
    this.concreteTasks = new Backbone.Collection();
    this.concreteTasks._loaded = false;
  },
  toJSON: function() {
    var base = {};
    Object.keys(this.attributes).forEach(function(attr) {
      base[attr] = this.attributes[attr];
    }, this);
    base.deadline = base.deadline.toLocaleString();
    base.appDeadline = base.appDeadline.toLocaleString();
    return base;
  }
});

var AppRouter = Backbone.Router.extend({
  initialize: function() {
    function onLogin(type, token, username) {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('type', type);
      window.localStorage.setItem('username', username);
      if(type === 'student') {
        window.application = new StudentApplication({
          token: token,
          username: username,
        });
        self.appView = new StudentApplicationView({
          model: window.application,
          el: document.getElementById('application'),
        });
        self.navigate('student/tasks', {trigger: true});
      } else {
        window.application = new TeacherApplication({
          token: token,
          username: username,
        });
        self.appView = new TeacherApplicationView({
          model: window.application,
          el: document.getElementById('application'),
        });
        self.navigate('teacher/tasks', {trigger: true});
      }
    }

    var self = this;
    if(!window.localStorage.getItem('token')) {
      var login = new LoginView({
        model: new Backbone.Model(),
        el: document.getElementById('application'),
      });
      return login.once('login', onLogin);
    }
    return onLogin(window.localStorage.getItem('type'), window.localStorage.getItem('token'), window.localStorage.getItem('username'));
  },
  routes: {
    'student/tasks': 'studentTasks',
    'student/tasks/:id': 'studentTask',
    'student/concrete-tasks': 'studentConcreteTasks',
    'student/concrete-tasks/:id': 'studentConcreteTask',
    'teacher/tasks': 'teacherTasks',
    'teacher/concrete-tasks': 'teacherConcreteTasks',
    'teacher/groups': 'teacherGroups',
    'teacher/groups/new': 'teacherNewGroup',
    'teacher/students': 'teacherStudents',
    'teacher/students/:id': 'teacherStudent',
    'teacher/students/new': 'teacherNewStudent',
    'teacher/tasks/new': 'teacherNewTask',
    'teacher/concrete-tasks/new': 'teacherNewConcreteTask',
    'logout': 'logout',
  },
  studentTasks: function() {
    this.appView.setTab('available');
  },
  studentConcreteTasks: function() {
    this.appView.setTab('current');
  },
  studentTask: function(id) {
    this.appView.showTask(id);
  },
  studentConcreteTask: function(id) {
    this.appView.showConcreteTask(id);
  },
  teacherTasks: function() {
    this.appView.setTab('tasks');
  },
  teacherConcreteTasks: function() {
    this.appView.setTab('concrete-tasks');
  },
  teacherGroups: function() {
    this.appView.setTab('groups');
  },
  teacherStudents: function() {
    this.appView.setTab('students');
  },
  teacherStudent: function(id) {
    this.appView.activeView = new TeacherStudentView({
      model: window.application.students.get(id)
    });
    this.appView._name = null;
    this.appView.update();
  },
  teacherNewTask: function() {
    this.appView.activeView = new TeacherTaskCreateView({
      model: new Backbone.Model(),
    });
    this.appView._name = null;
    this.appView.update();
  },
  teacherNewConcreteTask: function() {
    this.appView.activeView = new TeacherConcreteTaskCreateView({
      model: new Backbone.Model(),
    });
    this.appView._name = null;
    this.appView.update();
  },
  teacherNewStudent: function() {
    this.appView.activeView = new TeacherStudentCreateView({
      model: new Backbone.Model(),
    });
    this.appView._name = null;
    this.appView.update();
  },
  teacherNewGroup: function() {
    this.appView.activeView = new TeacherGroupCreateView({
      model: new Backbone.Model(),
    });
    this.appView._name = null;
    this.appView.update();
  },
  logout: function() {
    window.localStorage.removeItem('type');
    window.localStorage.removeItem('token');
    this.navigate('');
    AppRouter.prototype.initialize.call(this);
  }
});

window.onload = function() {
  window.appRouter = new AppRouter();
  Backbone.history.start({pushState: true});
};
