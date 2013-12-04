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
    } else if(name === 'concrete-tasks') {
      this.activeView = new TeacherConcreteTasksView({
        collection: this.model.concreteTasks
      });
    } else if(name === 'groups') {
      this.activeView = new TeacherGroupsView({
        collection: this.model.groups
      });
    } else if(name === 'students') {
      this.activeView = new TeacherStudentsView({
        collection: this.model.students
      });
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
    if(this.el.querySelector('#nav-' + this._name)) {
      this.el.querySelector('#nav-' + this._name).classList.add('active');
    }
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
    this.tasks = new Backbone.Collection([], { model: Task });
    this.concreteTasks = new Backbone.Collection([], { model: ConcreteTask });
    this.students = new Backbone.Collection([], { model: Student });
    this.groups = new Backbone.Collection([], { model: Group });
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
  getCollection: function(route, collection, model) {
    if(collection._loaded) {
      return collection;
    }
    this.ajax.get('/api/teacher/' + route, null, function(data) {
      collection.add(data.map(function(m) {
        return new model(m);
      }));
      collection._loaded = true;
    });
    return collection;
  },
  getItem: function(route, collection, id, model, fn) {
    if(collection.get('id') && collection.get('id')._detailsLoaded) {
      return fn(collection.get('id'));
    }
    this.ajax.get('/api/teacher/' + route + '/' + id, null, function(data) {
      var m = new model(data);
      collection.add(m);
      m._detailsLoaded = true;
      fn(m);
    });
  },
  createItem: function(route, collection, data) {
    var self = this;
    this.ajax.post('/api/teacher/' + route, data, function() {
      collection._loaded = false;
      window.appRouter.navigate('teacher/' + route, { trigger: true });
    });
  },
  deleteItem: function(route, collection, id) {
    var self = this;
    this.ajax.delete('/api/teacher/' + route + '/' + id, null, function() {
      collection.remove(id);
      window.appRouter.navigate('teacher/' + route);
    });
  },
  getTasks:         function() { return this.getCollection('tasks', this.tasks, Task); },
  getConcreteTasks: function() { return this.getCollection('concrete-tasks', this.concreteTasks, ConcreteTask); },
  getGroups:        function() { return this.getCollection('groups', this.groups, Group); },
  getStudents:      function() { return this.getCollection('students', this.students, Student); },
  getTask:         function(id, fn) { this.getItem('tasks', this.tasks, id, Task, fn); },
  getConcreteTask: function(id, fn) { this.getItem('concrete-tasks', this.concreteTasks, id, ConcreteTask, fn); },
  getGroup:        function(id, fn) { this.getItem('groups', this.groups, id, Group, fn); },
  getStudent:      function(id, fn) { this.getItem('students', this.students, id, Student, fn); },
  createTask:         function(data) { this.createItem('tasks', this.tasks, data); },
  createConcreteTask: function(data) { this.createItem('concrete-tasks', this.concreteTasks, data); },
  createGroup:        function(data) { this.createItem('groups', this.groups, data); },
  createStudent:      function(data) { this.createItem('students', this.students, data); },
  deleteTask:         function(id) { this.deleteItem('tasks', this.tasks, id); },
  deleteConcreteTask: function(id) { this.deleteItem('concrete-tasks', this.concreteTasks, id); },
  deleteStudent:      function(id) { this.deleteItem('students', this.students, id); },
  deleteGroup:        function(id) { this.deleteItem('groups', this.groups, id); },
  removeTaskFromGroup: function(task, group) {
    this.ajax.delete('/api/teacher/tasks/' + task.get('id') + '/groups/' + group.get('id'), null, function() {
      task.groups.remove(group);
    });
  },
  addTaskToGroup: function(task, group) {
    this.ajax.post('/api/teacher/tasks/' + task.get('id') + '/groups', { id: group.get('id') }, function() {
      task.groups.add(group);
    });
  },
  deleteStudentApplication: function(student, concreteTask) {
    this.ajax.delete('/api/teacher/concrete-tasks/' + concreteTask.get('id') + '/students/' + student.get('id'), null, function() {
      concreteTask.students.remove(student);
    });
  },
  addStudentApplication: function(student, concreteTask) {
    this.ajax.post('/api/teacher/concrete-tasks/' + concreteTask.get('id') + '/students', { id: student.get('id') }, function() {
      concreteTask.students.add(student);
    });
  },
  removeStudentFromGroup: function(student, group) {
    this.ajax.delete('/api/teacher/groups/' + group.get('id') + '/students/' + student.get('id'), null, function() {
      group.students.remove(student);
    });
  },
  addStudentToGroup: function(student, group) {
    this.ajax.post('/api/teacher/groups/' + group.get('id') + '/students', { id: student.get('id') }, function() {
      group.students.add(student);
    });
  }
});
