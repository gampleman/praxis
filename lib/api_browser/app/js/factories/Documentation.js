app.factory('docsCache', function($cacheFactory) {
  return $cacheFactory('DocsCache');
})﻿
.factory('Documentation', function($window, docsCache, $q, $location, $timeout) {
  var docsDefers = {}, get = function() {};
  if ($window.io) {
    var socket = $window.io($location.protocol() + '://' + $location.host() + ':' + $location.port());
    socket.on('doc', function(data) {
      if (docsDefers[data.filename]) {
        docsDefers[data.filename].notify(_.cloneDeep(data.contents));
      } else {
        var deffered = $q.defer();
        docsDefers[data.filename] = deffered;
        deffered.notify(_.cloneDeep(data.contents));
      }
      docsCache.put(data.filename, data.contents);
    });
    get = function(path) {
      socket.emit('get', path);
    }
  }

  function getDoc(path, callback) {
    if (docsDefers[path]) {
      docsDefers[path].promise.then(null, null, callback);
    } else {
      var deffered = $q.defer();
      docsDefers[path] = deffered;
      docsDefers[path].promise.then(null, null, callback);
    }

    if (docsCache.get(path)) {
      $timeout(function() {
        callback(docsCache.get(_.cloneDeep(path))); 
      });
    }

    get(path);
    return docsDefers[path].promise;
  }

  return {
    getIndex: function(cb) {
      return getDoc('index.json', cb);
    },
    getController: function(version, name, cb) {
      return getDoc(version + '/resources/' + name + '.json', cb);
    },
    getType: function(version, name, cb) {
      return getDoc(version + '/types/' + name + '.json', cb);
    },
    getTemplates: function(version, cb) {
      return getDoc(version + '/templates.json', cb);
    }
  };
});
