  return exports.index;
}).apply(this, function(){
  var exports = {
    builtins: {},
    modules: {},
    fs: {
      readFile: function(path, encoding, callback){
        var xhr = new XMLHttpRequest;
        xhr.onerror = xhr.onload = function(evt){
          if (xhr.readyState === 4) {
            xhr.onload = xhr.onerror = null;
            callback(null, xhr.responseText);
          }
        }

        xhr.open('GET', path);
        xhr.send();
      }
    }
  };

  function require(request){
    request = request.slice(request.lastIndexOf('/') + 1);
    return exports[request];
  }

  return [this, exports, require];
}());
