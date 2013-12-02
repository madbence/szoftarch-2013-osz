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
    if(!this.model.availableTasks._loaded) {
      return this.model.once('loaded:availableTasks', this.showTask.bind(this, id));
    }
    this.activeView = new StudentAbstractTaskView({
      model: this.model.availableTasks.get(id)
    });
    this.update();
  },
  showConcreteTask: function(id) {
    var self = this;
    if(!this.model.currentTasks._loaded) {
      return this.model.once('loaded:currentTasks', this.showConcreteTask.bind(this, id));
    }
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

var StudentApplication = Backbone.Model.extend({
  initialize: function() {
    this.availableTasks = new Backbone.Collection([], {
      model: Task
    });
    this.currentTasks = new Backbone.Collection([], {
      model: ConcreteTask
    });
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
    this.loadAvailableTasks();
    this.loadCurrentTasks();
  },
  loadAvailableTasks: function() {
    var self = this;
    if(this.availableTasks._loaded) {
      return;
    }
    this.ajax.get('/api/student/tasks', null, function(tasks) {
      self.availableTasks.add(tasks);
      self.availableTasks._loaded = true;
      self.trigger('loaded:availableTasks');
    });
  },
  loadCurrentTasks: function() {
    var self = this;
    if(this.currentTasks._loaded) {
      return;
    }
    this.ajax.get('/api/student/concrete-tasks', null, function(tasks) {
      self.currentTasks.add(tasks);
      self.currentTasks._loaded = true;
      self.trigger('loaded:currentTasks');
    });
  },
  loadAbstractTask: function(id) {
    var task = this.availableTasks.get(id);
    var self = this;
    if(task.concreteTasks._loaded) {
      return;
    }
    this.ajax.get('/api/student/tasks/' + id, null, function(model) {
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
    });
  },
  addTask: function(task) {
    if(task.get('applied') ||
       task.get('currentApplications') >= task.get('maxApplications') ||
       task.get('deadline').getTime() < Date.now()) {
      return;
    }
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/api/student/concrete-tasks/' + task.get('id'),
      dataType: 'json',
          headers: {
            'X-Token': self.get('token')
          },
      success: function() {
        task.set('applied', true);
        task.set('currentApplications', task.get('currentApplications')+1);
        self.currentTasks.add(task);
      }
    });
  },
  removeTask: function(task) {
    if(!task.get('applied') ||
       task.get('deadline').getTime() < Date.now()) {
      return;
    }
    var self = this;
    $.ajax({
      type: 'DELETE',
      url: '/api/student/concrete-tasks/' + task.get('id'),
          headers: {
            'X-Token': self.get('token')
          },
      dataType: 'json',
      success: function() {
        task.set('applied', false);
        task.set('currentApplications', task.get('currentApplications')-1);
        self.currentTasks.remove(task);
      }
    });
  }
});
