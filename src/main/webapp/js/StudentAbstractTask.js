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
