(function() {
  'use strict';  var XMLHttpRequest, defer, extend;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  extend = require('../common').extend;
  defer = require('q').defer;
  XMLHttpRequest = require('xhr').XMLHttpRequest;
  exports.request = function(options) {
    var body, deferred, header, headers, method, mimeType, password, url, username, value;
    headers = options.headers, method = options.method, url = options.url, username = options.username, password = options.password, mimeType = options.mimeType, body = options.body;
    this.content = '';
    this.xhr = new XMLHttpRequest;
    this.xhr.open(method, url, true, username, password);
    if (username && password) {
      this.xhr.withCredentials = true;
    }
    for (header in headers) {
      value = headers[header];
      this.xhr.setRequestHeader(header, value);
    }
    if (mimeType) {
      this.xhr.overrideMimeType(mimeType);
    }
    this.xhr.onreadystatechange = __bind(function() {
      var response;
      if (this.xhr.readyState === 4) {
        if (this.xhr.status === 0 || xhr.status === 200) {
          if (mimeType === 'xml') {
            response = this.xhr.responseXML;
          } else {
            response = this.xhr.responseText;
          }
          return deferred.resolve(response);
        } else {
          return deferred.reject({
            at: 'request',
            message: 'Failure in XMLHttpRequest',
            request: this.xhr
          });
        }
      }
    }, this);
    this.xhr.send(body);
    deferred = defer();
    return deferred.promise;
  };
  extend(exports);
}).call(this);
