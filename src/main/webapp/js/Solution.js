var StudentSolutionView = BaseView.extend({
  templateSelector: '#student-solution',
  events: {
    'dragover #upload-zone': 'cancel',
    'dragenter #upload-zone': 'cancel',
    'drop #upload-zone': 'upload'
  },
  initialize: function(opt) {
    var self = this;
    this.baseModel = opt.baseModel;
    $.ajax({
      type: 'GET',
      url: '/api/student/concrete-tasks/' + opt.baseModel.get('id') + '/solution',
      success: function(solution) {
        self.model = new Backbone.Model(solution);
        BaseView.prototype.initialize.call(self, opt);
      },
      error: function() {
        self.model = new Backbone.Model();
        BaseView.prototype.initialize.call(self, opt);
      }
    });
  },
  cancel: function(e) {
    e.preventDefault();
    return false;
  },
  update: function() {
    if(!this.model.get('id')) {
      this.el.querySelector('#last-upload').style.display = 'none';
    } else {
      this.el.querySelector('#last-upload').style.display = 'block';
    }
    if(this.model.get('result') != null) {
      this.el.querySelector('#solution-result').style.display = 'inline';
    } else {
      this.el.querySelector('#solution-result').style.display = 'none';
    }
    if(this.baseModel.get('appDeadline').getTime() < Date.now()) {
      this.el.querySelector('#upload-zone').style.display = 'none';
    } else {
      this.el.querySelector('#upload-zone').style.display = 'block';
    }
  },
  upload: function(e) {
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    var self = this;
    formData.append('file', file);
    xhr.open('post', '/api/student/concrete-tasks/' + this.baseModel.get('id') + '/solution');
    xhr.upload.addEventListener('progress', function(e) {
      console.log('progress', e);
      self.el.querySelector('#upload-progress').style.width = (e.loaded/e.total*100).toFixed(2) + '%';
    });
    xhr.addEventListener('load', function(e) {
      self.model = new Backbone.Model(JSON.parse(xhr.responseText));
      self.render();
    });
    xhr.addEventListener('error', function(e) {
      console.log('error', e);
    });
    xhr.send(formData);
    console.log(file);
    return false;
  }
});
