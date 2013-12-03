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
  },
});

var Group = Backbone.Model.extend({
  initialize: function(data) {
    this.students = new Backbone.Collection(data.students ? data.students : [], {
      model: Student
    });
  },
  addStudent: function(student) {
    window.application.addStudentToGroup(student, this);
  },
  removeStudent: function(student) {
    window.application.removeStudentFromGroup(student, this);
  },
  addTask: function(task) {
    window.application.addTaskToGroup(task, this);
  },
  removeTask: function(task) {
    window.application.removeTaskFromGroup(task, this);
  }
});

var Student = Backbone.Model.extend({
  initialize: function(data) {
    this.solutions = new Backbone.Collection(data.solutions ? data.solutions : [], {
      model: Solution
    });
  }
});

var Solution = Backbone.Model.extend({});
