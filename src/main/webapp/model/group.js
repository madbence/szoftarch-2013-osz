exports.all = function all(fn) {
  exports.mysql.query('SELECT * FROM groups', fn);
};

exports.create = function create(opt, fn) {
  exports.mysql.query('INSERT INTO groups (title) VALUES(?)', [opt.name], fn);
};

exports.delete = function _delete(id, fn) {
  exports.mysql.query('DELETE FROM groups WHERE id = ?', [id], fn);
};
