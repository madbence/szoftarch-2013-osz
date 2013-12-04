_.templateSettings.interpolate = /\{\{(.*?)\}\}/g;

function appBtnState(task) {
  if(!task.get('deadline')) {
    return {
      hide: true
    };
  }
  if(task.get('deadline').getTime() < Date.now()) {
    return {
      text: 'A jelentkezési határidő lejárt',
      disabled: true
    };
  }
  if(task.get('applied')) {
    return {
      text: 'Lejelentkezés',
    };
  }
  if(task.get('maxApplications') && task.get('maxApplications') <= task.get('currentApplications')) {
    return {
      text: 'A létszámlimit betelt!',
      disabled: true
    };
  }
  if(task.parent && task.parent.concreteTasks.some(function(task) { return task.get('applied'); })) {
    return {
      text: 'Másik feladatra jelentkeztél!',
      disabled: true
    };
  }
  return {
    text: 'Jelentkezés',
  };
}

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
    if(this.model) {
      this.model.on('change', this.update.bind(this));
    }
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
    this.collection.on('remove', this.remove.bind(this));
    this._childViews = [];
    this.childViewClass = this.childViewClass || options.childViewClass;
    var listCtor = options.emptyListView || this.emptyListView;
    this._emptyListView = new listCtor();
    this.collection.each(function(model) {
      this.add(model);
    }, this);
    if(this._childViews.length === 0) {
      this._listContainer.appendChild(this._emptyListView.el);
    }
  },
  add: function(model) {
    var self = this;
    model.on('change', function() {
      self._childViews.forEach(function(child) {
        child.update();
      });
    });
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
  },
  remove: function(model, collection, options) {
    console.log(arguments);
    var view = this._childViews.splice(options.index, 1);
    this._listContainer.removeChild(view[0].el);
    if(this._childViews.length === 0) {
      this._listContainer.appendChild(this._emptyListView.el);
    }
  }
});

var SelectView = Backbone.View.extend({
  tagName: 'select',
  initialize: function(opt) {
    this.valueProperty = opt.valueProperty || 'id';
    this.itemRenderer = opt.itemRenderer || null;
    this.itemProperty = opt.itemProperty || 'title';
    this.collection.on('add', this.render.bind(this));
    this.collection.on('remove', this.render.bind(this));
    this.render();
  },
  render: function() {
    this.el.innerHTML = this.collection.map(function(item) {
      var text = this.itemRenderer ? this.itemRenderer(item) : item.get(this.itemProperty);
      return '<option value="' + item.get(this.valueProperty) + '">' + text + '</option>';
    }, this).join('');
  },
  selectedItem: function() {
    return this.collection.get(this.el.value);
  }
});

var SimpleCollectionView = Backbone.View.extend({
  initialize: function(opt) {
    this._childViews = [];
    this._childViewClass = opt.childViewClass;
    this.parentView = opt.parentView;
    this.collection
      .on('add', this.add.bind(this))
      .on('remove', this.remove.bind(this));
    this._placeholder = new EmptyListItemView();
    this.el.appendChild(this._placeholder.el);
    this.collection.each(this.add.bind(this));
  },
  add: function(model) {
    var view = new (this._childViewClass)({
      model: model
    });
    view.parentView = this.parentView;
    if(this._childViews.length === 0) {
      this.el.removeChild(this._placeholder.el);
    }
    this._childViews.push(view);
    this.el.appendChild(view.el);
  },
  remove: function(model, collection, opt) {
    var view = this._childViews.splice(opt.index, 1)[0];
    this.el.removeChild(view.el);
    if(this._childViews.length === 0) {
      this.el.appendChild(this._placeholder.el);
    }
  },
});

var EmptyListItemView = BaseView.extend({
  className: 'task',
  initialize: function() {
    this.render();
  },
  render: function() {
    this.el.innerHTML = 'Nincs elérhető bejegyzés';
  }
});
