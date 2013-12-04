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
    'logout': 'logout',
    'teacher/:coll': 'teacherCollection',
    'teacher/:coll/new': 'teacherNewItem',
    'teacher/:coll/:id': 'teacherItem',
  },
  teacherCollection: function(collection) {
    var mapping = {
      'tasks': 'getTasks',
      'concrete-tasks': 'getConcreteTasks',
      'groups': 'getGroups',
      'students': 'getStudents'
    };
    if(!mapping[collection]) { return; }
    window.application[mapping[collection]]();
    this.appView.setTab(collection);
  },
  teacherNewItem: function(collection) {
    var mapping = {
      'tasks':          TeacherTaskCreateView,
      'concrete-tasks': TeacherConcreteTaskCreateView,
      'groups':         TeacherGroupCreateView,
      'students':        TeacherStudentCreateView,
    };
    if(!mapping[collection]) { return; }
    this.appView.activeView = new mapping[collection]({
      model: new Backbone.Model()
    });
    this.appView._name = null;
    this.appView.update();
  },
  teacherItem: function(collection, id) {
    var mapping = {
      'tasks':          { view: TeacherTaskView, getter: 'getTask' },
      'concrete-tasks': { view: TeacherConcreteTaskView, getter: 'getConcreteTask' },
      'groups':         { view: TeacherGroupView, getter: 'getGroup' },
      'students':       { view: TeacherStudentView, getter: 'getStudent' },
    };
    if(!mapping[collection]) { return; }
    var self = this;
    window.application[mapping[collection].getter](id, function(model) {
      self.appView.activeView = new (mapping[collection].view)({
        model: model
      });
      self.appView._name = null;
      self.appView.update();
    });
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
  logout: function() {
    window.localStorage.removeItem('type');
    window.localStorage.removeItem('token');
    this.navigate('');
    AppRouter.prototype.initialize.call(this);
  }
});
