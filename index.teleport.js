(function() {
  'use strict';  var defer, extend;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  extend = require('./lib/common').extend;
  defer = require('q').defer;
  exports.request = function(options) {
    var body, deferred, header, headers, method, mimeType, password, url, username, value, xhr;
    headers = options.headers, method = options.method, url = options.url, username = options.username, password = options.password, mimeType = options.mimeType, body = options.body;
    xhr = new XMLHttpRequest;
    xhr.open(method, url, true, username, password);
    if (username && password) {
      xhr.withCredentials = true;
    }
    for (header in headers) {
      value = headers[header];
      xhr.setRequestHeader(header, value);
    }
    if (mimeType) {
      xhr.overrideMimeType(mimeType);
    }
    xhr.onreadystatechange = __bind(function() {
      var response;
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          if (mimeType === 'xml') {
            response = xhr.responseXML;
          } else {
            response = xhr.responseText;
          }
          return deferred.resolve(response);
        } else {
          return deferred.reject({
            at: 'request',
            message: 'Failure in XMLHttpRequest',
            request: xhr
          });
        }
      }
    }, this);
    xhr.send(body);
    deferred = defer();
    return deferred.promise;
  };
  extend(exports);
}).call(this);
