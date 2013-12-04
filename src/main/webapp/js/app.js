/* jshint boss: true */


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

var TeacherStudentItemView3 = BaseView.extend({
  templateSelector: '#teacher-student-item3',
  className: 'task',
  events: {
    'click .delete': 'delete',
  },
  'delete': function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.application.removeStudentFromGroup(this.model, this.parentView.model);
  }
});
var TeacherStudentItemView2 = BaseView.extend({
  templateSelector: '#teacher-student-item2',
  className: 'task',
  events: {
    'click .delete': 'delete',
  },
  'delete': function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.application.deleteStudentApplication(this.model, this.parentView.model);
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
  templateSelector: '#teacher-student',
  initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    var solutionView = new SimpleCollectionView({
      collection: this.model.solutions,
      el: this.el.querySelector('#solutions'),
      childViewClass: TeacherSolutionViewItem
    });
  },
  update: function() {
    this.el.querySelector('#student-solutions') && (this.el.querySelector('#student-solutions').innerText = this.model.solutions.size());
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
var TeacherGroupItemView2 = BaseView.extend({
  templateSelector: '#teacher-group-item2',
  className: 'task',
  events: {
    'click .delete': 'delete',
  },
  'delete': function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.model.removeTask(this.parentView.model);
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
var TeacherGroupView = BaseView.extend({
  templateSelector: '#teacher-group',
  events: {
    'click #add-student': 'add',
  },
  initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.selectView = new SelectView({
      collection: window.application.getStudents(),
      el: this.el.querySelector('#student-list'),
      itemRenderer: function(model) { return model.get('name') + ' (' + model.get('neptun') + ')'; },
    });
    var membersView = new SimpleCollectionView({
      collection: this.model.students,
      el: this.el.querySelector('#students-list'),
      childViewClass: TeacherStudentItemView3,
      parentView: this,
    });
    this.model.students
      .on('add', this.update.bind(this))
      .on('remove', this.update.bind(this));
  },
  update: function() {
    this.el.querySelector('#group-members') && (this.el.querySelector('#group-members').innerText = this.model.students.size());
  },
  add: function() {
    window.application.addStudentToGroup(this.selectView.selectedItem(), this.model);
  }
});
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
    var self = this;
    var select = new SelectView({
      el: this.el.querySelector('select'),
      collection: window.application.getGroups()
    });
  },
  events: {
    'click .create': 'create',
  },
  create: function() {
    window.application.createTask({
      title: this.el.querySelector('#title').value,
      description: this.el.querySelector('#description').value,
    });
  }
});

var TeacherConcreteTaskItemView = BaseView.extend({
  templateSelector: '#teacher-concrete-task-item',
  className: 'task',
  events: {
    'click .delete': 'remove',
  },
  remove: function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.application.deleteConcreteTask(this.model.get('id'));
  }
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
var TeacherConcreteTaskView = BaseView.extend({
  templateSelector: '#teacher-concrete-task',
  events: {
    'click #add-student': 'add'
  },
  initialize: function(opt) {
    BaseView.prototype.initialize.apply(this, arguments);
    this.selectView = new SelectView({
      collection: window.application.getStudents(),
      el: this.el.querySelector('#students-list'),
      itemRenderer: function(model) { return model.get('name') + ' (' + model.get('neptun') + ')'; },
    });
    var studentList = new SimpleCollectionView({
      collection: this.model.students,
      childViewClass: TeacherStudentItemView2,
      parentView: this,
      el: this.el.querySelector('#student-list')
    });
    this.model.students
      .on('add', this.update.bind(this))
      .on('remove', this.update.bind(this));
  },
  add: function() {
    window.application.addStudentApplication(this.selectView.selectedItem(), this.model);
  },
  update: function() {
    this.el.querySelector('#applied-students') && (this.el.querySelector('#applied-students').innerText = this.model.students.size());
  }
});
var TeacherConcreteTaskCreateView = BaseView.extend({
  templateSelector: '#teacher-concrete-task-new',
  initialize: function(opt) {
    BaseView.prototype.initialize.apply(this, arguments);
    var self = this;
    var selectView = new SelectView({
      collection: window.application.getTasks(),
      el: this.el.querySelector('#task-list')
    });
  },
  events: {
    'click .create': 'create',
  },
  create: function() {
    window.application.createConcreteTask({
      title: this.el.querySelector('#title').value,
      description: this.el.querySelector('#description').value,
      maxApplications: this.el.querySelector('#maxApplications').value,
      deadline: this.el.querySelector('#deadline').value,
      appDeadline: this.el.querySelector('#appDeadline').value,
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
  'delete': function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.application.deleteTask(this.model.get('id'));
  }
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

var TeacherTaskView = BaseView.extend({
  templateSelector: '#teacher-task',
  events: {
    'click #add-group': 'add',
  },
  initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.groupSelect = new SelectView({
      collection: window.application.getGroups(),
      el: this.el.querySelector('#group-list')
    });
    var groupList = new SimpleCollectionView({
      parentView: this,
      childViewClass: TeacherGroupItemView2,
      collection: this.model.groups,
      el: this.el.querySelector('#task-groups')
    });
    var subtaskList = new SimpleCollectionView({
      childViewClass: TeacherConcreteTaskItemView,
      collection: this.model.concreteTasks,
      el: this.el.querySelector('#task-subtasks')
    });
    this.model.groups
      .on('add', this.update.bind(this))
      .on('remove', this.update.bind(this));
  },
  add: function() {
    window.application.addTaskToGroup(this.model, this.groupSelect.selectedItem());
  },
  update: function() {
    this.el.querySelector('#group-count') && (this.el.querySelector('#group-count').innerText = this.model.groups.size());
  }
});

var TeacherSolutionViewItem = BaseView.extend({
  templateSelector: '#teacher-solution-item',
  className: 'task solution',
  events: {
    'click': 'sav'
  },
  sav: function(e) {
    $.ajax({
      type: 'put',
      url: '/api/teacher/solutions/' + this.model.get('id'),
      data: JSON.stringify({ grade: this.el.querySelector('#grade').value, comment: this.el.querySelector('#comment').value }),
      headers: { 'x-token': window.application.get('token') },
      dataType: 'json',
      contentType: 'application/json'
    });
  },
  update: function() {
    if(this.model.get('appDeadline').getTime() > Date.now()) {
      this.el.querySelector('#save').innerText = 'A feladat még beadható!';
      this.el.querySelector('#save').disabled = true;
    }
  }
});

var RateView = BaseView.extend({});

window.onload = function() {
  window.appRouter = new AppRouter();
  Backbone.history.start({pushState: true});
};
