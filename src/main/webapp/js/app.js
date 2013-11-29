_.templateSettings.interpolate = /\{\{(.*?)\}\}/g;

var BaseView = Backbone.View.extend({
  initialize: function(options) {
    this._template = _.template(
      document.querySelector(
        options.templateSelector || this.templateSelector
      ).innerHTML, null, {
        variable: 'model'
      }
    );
    this.render();
  },
  update: function() {},
  render: function() {
    this.$el.html(this._template((this.model||this.collection).toJSON(), {
      variable: 'model'
    }));
    this.update();
    return this;
  }
});

var CollectionView = BaseView.extend({
  initialize: function(options) {
    BaseView.prototype.initialize.apply(this, arguments);
    this._listContainer = this.el.querySelector(options.containerSelector || this.containerSelector);
    this.collection.on('add', this.add.bind(this));
    this._childViews = [];
    this.childViewClass = this.childViewClass || options.childViewClass;
    this._emptyListView = new (options.emptyListView || this.emptyListView)();
    this.collection.each(function(model) {
      this.add(model);
    }, this);
    if(this._childViews.length === 0) {
      this._listContainer.appendChild(this._emptyListView.el);
    }
  },
  add: function(model) {
    if(this._childViews.length === 0) {
      try {
        this._listContainer.removeChild(this._emptyListView.el);
      } catch(e) {
      }
    }
    var el = document.createElement('li');
    var view = new (this.childViewClass)({
      model: model,
      tagName: 'li',
    });
    this._childViews.push(view);
    this._listContainer.appendChild(view.el);
  }
});

var LoginView = BaseView.extend({});
var LayoutView = BaseView.extend({});
var StudentApplicationView = BaseView.extend({
  events: {
    'click a': function(e) {
      e.preventDefault();
      window.appRouter.navigate(e.currentTarget.pathname.substr(1), {trigger: true});
    }
  },
  templateSelector: '#student-dashboard',
  initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.availableTasksView = new StudentAbstractTasksView({
      collection: this.model.availableTasks
    });
    this.currentTasksView = new StudentConcreteTasksView({
      collection: this.model.currentTasks
    });
    this.activeView = this.availableTasksView;
    this.update();
  },
  setTab: function(name) {
    if(name === 'current') {
      this.activeView = this.currentTasksView;
    } else if(name === 'available') {
      this.activeView = this.availableTasksView;
    }
    this.update();
  },
  update: function() {
    if(!this.activeView) return;
    this.el.querySelector('#nav-tasks').classList[this.activeView == this.availableTasksView ? 'add' : 'remove']('active');
    this.el.querySelector('#nav-concrete-tasks').classList[this.activeView == this.currentTasksView ? 'add' : 'remove']('active');
    var container = this.el.querySelector('#subview-container');
    if(container.childNodes.length === 0) {
      container.appendChild(this.activeView.el);
    } else if(container.childNodes[0] !== this.activeView.el) {
      container.removeChild(container.childNodes[0]);
      container.appendChild(this.activeView.el);
    }
  },
  showTask: function(id) {
    var self = this;
    this.activeView = new StudentAbstractTaskView({
      model: this.model.availableTasks.get(id)
    });
    this.update();
  },
  showConcreteTask: function(id) {
    var self = this;
    var model = this.model.availableTasks.find(function(task) {
      return task.concreteTasks.any(function(concreteTask) {
        return concreteTask.id == id;
      });
    });
    if(model) {
      this.activeView = new StudentConcreteTaskView({
        model: model.concreteTasks.get(id)
      });
    } else {
      this.activeView = new StudentConcreteTaskView({
        model: this.model.currentTasks.get(id)
      });
    }
    this.update();
  }
});
var TeacherApplicationView = BaseView.extend({});

var EmptyListItemView = BaseView.extend({
  className: 'task',
  initialize: function() {
    this.render();
  },
  render: function() {
    this.el.innerHTML = 'Nincs elérhető bejegyzés';
  }
});

var StudentConcreteTaskItemView = BaseView.extend({
  templateSelector: '#student-concrete-task-item',
  className: 'task',
  update: function() {
    BaseView.prototype.update();
    this.el.classList[this.model.get('applied') ? 'add' : 'remove']('applied');
  }
});

var StudentConcreteTasksView = CollectionView.extend({
  templateSelector: '#student-current-tasks',
  containerSelector: '#current-tasks',
  emptyListView: EmptyListItemView,
  childViewClass: StudentConcreteTaskItemView
});

var StudentConcreteTaskView = BaseView.extend({
  templateSelector: '#student-concrete-task'
});

var StudentAbstractTaskItemView = BaseView.extend({
  templateSelector: '#student-task-item',
  className: 'task',
  events: {
    'click': 'showTask',
  },
  showTask: function(e) {
    e.preventDefault();
    window.appRouter.navigate('student/tasks/' + this.model.get('id'), {trigger: true});
  }
});

var StudentAbstractTasksView = CollectionView.extend({
  templateSelector: '#student-available-tasks',
  containerSelector: '#available-tasks',
  emptyListView: EmptyListItemView,
  childViewClass: StudentAbstractTaskItemView
});

var StudentAbstractTaskView = CollectionView.extend({
  templateSelector: '#student-task',
  containerSelector: '#concrete-tasks',
  emptyListView: EmptyListItemView,
  childViewClass: StudentConcreteTaskItemView,
  initialize: function() {
    var self = this;
    this.collection = this.model.concreteTasks;
    CollectionView.prototype.initialize.apply(this, arguments);
    window.application.loadAbstractTask(this.model.get('id'));
  }
});

var StudentSolutionView = BaseView.extend({});

var StudentsView = CollectionView.extend({});
var StudentView = BaseView.extend({});
var StudentCreateView = BaseView.extend({});

var GroupsView = CollectionView.extend({});
var GroupView = BaseView.extend({});
var GroupCreateView = BaseView.extend({});

var TeacherTasksView = CollectionView.extend({});
var TeacherTaskView = BaseView.extend({});
var TeacherTaskCreateView = BaseView.extend({});

var TeacherConcreteTasksView = CollectionView.extend({});
var TeacherConcreteTaskView = BaseView.extend({});
var TeacherConcreteTaskCreateView = BaseView.extend({});

var RateView = BaseView.extend({});

var StudentApplication = Backbone.Model.extend({
  initialize: function() {
    this.availableTasks = new Backbone.Collection([], {
      model: Task
    });
    this.currentTasks = new Backbone.Collection([], {
      model: ConcreteTask
    });
    this.loadAvailableTasks();
    this.loadCurrentTasks();
  },
  loadAvailableTasks: function() {
    var self = this;
    if(this.availableTasks._loaded) {
      return;
    }
    $.ajax({
      type: 'GET',
      url: '/api/student/tasks',
      dataType: 'json',
      success: function(tasks) {
        self.availableTasks.add(tasks);
        self.availableTasks._loaded = true;
      }
    });
  },
  loadCurrentTasks: function() {
    var self = this;
    if(this.currentTasks._loaded) {
      return;
    }
    $.ajax({
      type: 'GET',
      url: '/api/student/concrete-tasks',
      dataType: 'json',
      success: function(tasks) {
        self.currentTasks.add(tasks);
        self.currentTasks._loaded = true;
      }
    });
  },
  loadAbstractTask: function(id, fn) {
    var task = this.availableTasks.get(id);
    var self = this;
    if(task.concreteTasks._loaded) {
      return;
    }
    $.ajax({
      type: 'GET',
      url: '/api/student/tasks/' + id,
      dataType: 'json',
      success: function(model) {
        model.concreteTasks.forEach(function(concreteTask) {
          if(self.currentTasks.get(concreteTask.id)) {
            concreteTask = self.currentTasks.get(concreteTask.id);
          } else {
            concreteTask = new ConcreteTask(concreteTask);
            concreteTask.parent = task;
          }
          task.concreteTasks.add(concreteTask);
        });
        task.concreteTasks._loaded = true;
      }
    });
  },
});

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
  routes: {
    '': 'home',
    'student/tasks': 'studentTasks',
    'student/tasks/:id': 'studentTask',
    'student/concrete-tasks': 'studentConcreteTasks',
    'student/concrete-tasks/:id': 'studentConcreteTask'
  },
  home: function() {
    window.application = new StudentApplication();
    this.appView = new StudentApplicationView({
      model: window.application,
      el: document.getElementById('application'),
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
});

window.onload = function() {
  window.appRouter = new AppRouter();
  Backbone.history.start({pushState: true});
};
