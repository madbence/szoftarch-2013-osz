var StudentConcreteTaskItemView = BaseView.extend({
  templateSelector: '#student-concrete-task-item',
  events: {
    'click .toggle': 'toggleApplication',
  },
  toggleApplication: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.model.toggleApplication();
  },
  className: 'task',
  update: function() {
    BaseView.prototype.update();
    this.el.classList[this.model.get('applied') ? 'add' : 'remove']('applied');
    var appState = appBtnState(this.model);
    var appBtn = this.el.querySelector('.toggle');
    appBtn.innerHTML = appState.text;
    appBtn.style.display = appState.hide ? 'none' : 'inline-block';
    appBtn.disabled = appState.disabled;

    this.el.querySelector('h4').innerHTML = this.model.get('currentApplications') + '/' + this.model.get('maxApplications') + ' fő';
  }
});

var StudentConcreteTasksView = CollectionView.extend({
  templateSelector: '#student-current-tasks',
  containerSelector: '#current-tasks',
  emptyListView: EmptyListItemView,
  childViewClass: StudentConcreteTaskItemView
});

var StudentConcreteTaskView = BaseView.extend({
  templateSelector: '#student-concrete-task',
  events: {
    'click .toggle': 'toggleApplication',
  },
  initialize: function() {
    this.solutionView = new StudentSolutionView({
      baseModel: this.model
    });
    BaseView.prototype.initialize.apply(this, arguments);
  },
  render: function() {
    BaseView.prototype.render.apply(this, arguments);
    this.el.appendChild(this.solutionView.el);
  },
  toggleApplication: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.model.toggleApplication();
  },
  update: function() {
    var appState = appBtnState(this.model);
    var appBtn = this.el.querySelector('.toggle');
    appBtn.innerHTML = appState.text;
    appBtn.style.display = appState.hide ? 'none' : 'inline-block';
    appBtn.disabled = appState.disabled;
    //this.el.querySelector('h4').innerHTML = this.model.get('currentApplications') + '/' + this.model.get('maxApplications') + ' fő';
  }
});
