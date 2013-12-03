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
    var select = new SelectView({
      el: this.el.querySelector('select'),
      collection: window.application.groups
    });
    window.application.loadGroups();
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

window.onload = function() {
  window.appRouter = new AppRouter();
  Backbone.history.start({pushState: true});
};
