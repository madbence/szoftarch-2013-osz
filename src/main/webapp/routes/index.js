exports.errorHandler = function errorHandler(req) {
  return function(fn) {
    return function() {
      var lastArg = arguments[arguments.length-1];
      arguments[arguments.length-1] = function(err) {
        if(err) {
          console.log(err);
          return req.next(err);
        }
        lastArg.apply(null, [].slice.call(arguments, 1));
      };
      fn.apply(null, arguments);
    };
  };
};
