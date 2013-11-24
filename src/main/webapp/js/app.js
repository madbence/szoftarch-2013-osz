var TaskModel = Backbone.Model.extend({
  toJSON: function() {
    var model = this.attributes;
    model.rawDeadline = model.deadline;
    model.rawAppDeadline = model.appDeadline;
    return model;
  }
});
var TaskCollection = Backbone.Collection.extend({});
var ConcreteTaskModel = TaskModel.extend({
  initialize: function() {
    if(this.attributes.description == null) {
      this.set('description', '');
    }
  },
  loadDetails: function(cb) {
    if(this.detailsLoaded) {
      return cb();
    }
    var self = this;
    $.ajax({
      type: 'GET',
      url: '/concrete-tasks/' + this.get('id'),
      dataType: 'json',
      success: function(data) {
        Object.keys(data).forEach(function(key) {
          self.set(key, data[key]);
        });
        self.detailsLoaded = true;
        cb();
      }
    });
  }
});
var AbstractTaskModel = TaskModel.extend({
  initialize: function() {
    this.concreteTasks = new TaskCollection([], {
      model: ConcreteTaskModel
    });
    this.detailsLoaded = false;
  },
  loadConcreteTasks: function(cb) {
    var self = this;
    if(this.detailsLoaded) {
      return cb();
    }
    $.ajax({
      type: 'GET',
      url: 'tasks/' + this.get('id'),
      dataType: 'json',
      success: function(data) {
        self.detailsLoaded = true;
        self.concreteTasks.add(data);
        cb();
      }
    });
  },
});
var Application = Backbone.Model.extend({
  initialize: function() {
    this.abstractTasks = new TaskCollection([], {
      model: AbstractTaskModel
    });
    this.concreteTasks = new TaskCollection([], {
      model: ConcreteTaskModel
    });
  },
  loadTasks: function() {
    var self = this;
    $.ajax({
      type: 'GET',
      url: '/tasks',
      dataType: 'json',
      success: function(data) {
        data.forEach(function(model) {
          self.abstractTasks.add(model);
        });
      }
    });
  },
  takeUp: function(task) {
    task.set('applied', true);
    task.set('currentApp', task.get('currentApp')+1);
    this.concreteTasks.add(task);
  },
  dropDown: function(task) {
    task.set('applied', false);
    task.set('currentApp', task.get('currentApp')-1);
    this.concreteTasks.remove(task);
  }
});

var View = Backbone.View.extend({
  initialize: function(options) {
    this.template = _.template(document.getElementById(options.template).innerHTML);
  },
  render: function() {
    this.el.innerHTML=this.template(this.model.toJSON());
    return this;
  },
});

var ApplicationView = View.extend({
  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
  },
  render: function() {
    View.prototype.render.apply(this);
    this.abstractTaskCollection = new TaskCollectionView({
      collection: this.model.abstractTasks,
      view: AbstractTaskView,
      el: document.getElementById('current-tasks')
    }).render();
    this.concreteTaskCollection = new TaskCollectionView({
      collection: this.model.concreteTasks,
      view: ConcreteTaskView,
      el: document.getElementById('current-concrete-tasks')
    }).render();
    return this;
  }
});

var TaskCollectionView = View.extend({
  initialize: function(options) {
    this.view = options.view;
    this._childViews = [];
    this.collection.each(function(model) {
      this.add(model);
    }, this);
    this.collection.on('add', this.add.bind(this));
    this.collection.on('remove', this.remove.bind(this));
  },
  add: function(model) {
    if(this._childViews.length === 0) {
      this.el.innerHTML = '';
    }
    var el = document.createElement('li');
    el.className = 'task';
    this.el.appendChild(el);
    var view = new (this.view)({
      model: model,
      el: el
    });
    this._childViews.push(view);
    var self = this;
    view.on('resize', function() {
      self.trigger('resize');
    });
    view.render();
  },
  remove: function(model, collection, options) {
    this.el.removeChild(this._childViews[options.index].el);
    this._childViews.splice(options.index, 1);
    if(this._childViews.length === 0) {
      this.el.innerHTML = '<li class="empty task">Nincs elérhető bejegyzés</li>';
      return this;
    }
  },
  render: function() {
    if(this._childViews.length === 0) {
      this.el.innerHTML = '<li class="empty task">Nincs elérhető bejegyzés</li>';
      return this;
    }
    this._childViews.forEach(function(view) {
      view.render();
    });
  }
});

var TaskView = View.extend({
  initialize: function() {
    View.prototype.initialize.call(this, {
      template: 'task-tpl'
    });
  }
});

var AbstactSubtaskView = View.extend({
  events: {
    'click': 'toggleDetails',
    'click button': 'activate',
  },
  initialize: function() {
    View.prototype.initialize.call(this, {
      template: 'abstract-task-concrete-tpl'
    });
    this.model.on('change', this.render.bind(this));
    this.closed = true;
  },
  toggleDetails: function(e) {
    var self = this;
    e.stopPropagation();
    this.model.loadDetails(function() {
      self.closed = !self.closed;
      $('.details article', self.el)
        .html(self.model.get('description'));
      $('.details', self.el)
        .toggleClass('closed');
      self.trigger('resize');
    });
  },
  render: function() {
    View.prototype.render.call(this);
    this.$el.removeClass('applied');
    this.$el.removeClass('full');
    if(this.closed) {
      $('.details', this.el).addClass('closed');
    }
    if(this.model.get('applied')) {
      this.$el.addClass('applied');
      $('button', this.el).text('Lejelentkezek');
    } else if(this.model.get('currentApp') === this.model.get('maxApp')) {
      this.$el.addClass('full');
      $('button', this.el).attr('disabled', true);
    }
  },
  activate: function(e) {
    e.stopPropagation();
    if(!this.model.get('applied')) {
      window.app.takeUp(this.model);
    } else {
      window.app.dropDown(this.model);
    }
  }
});

var AbstractTaskView = TaskView.extend({
  events: {
    'click': 'toggleDetails',
  },
  initialize: function() {
    var self = this;
    TaskView.prototype.initialize.apply(this, arguments);
  },
  resize: function() {
    var el = $('.subtasks-wrapper', this.el); 
    if(!el.hasClass('closed')) {
      el.css('height', $('.subtasks', this.el).height() + 'px');
    } else {
      el.css('height', 0 );
    }
  },
  toggleDetails: function() {
    var self = this;
    this.model.loadConcreteTasks(function() {
      var el = $('.subtasks-wrapper', self.el); 
      el.toggleClass('closed');
      self.resize();
    });
  },
  render: function() {
    View.prototype.render.call(this);
    this._subtasks = new TaskCollectionView({
      collection: this.model.concreteTasks,
      view: AbstactSubtaskView,
      el: $('.subtasks', this.el)[0]
    });
    this._subtasks.on('resize', this.resize.bind(this));
  }
});

var ConcreteTaskView = TaskView.extend({});

var Router = Backbone.Router.extend({
  initialize: function() {
    window.app = new Application();
    this.appview = new ApplicationView({
      model: app,
      el: document.getElementById('application'),
      template: 'dashboard-tpl'
    });
    app.loadTasks();
  },
  routes: {
    '': 'home',
    'task/:id': 'task',
  },
  home: function() {
    this.appview.render();
  }
});

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var router = new Router();

window.addEventListener('load', function() {
  Backbone.history.start({pushState: true});
});
