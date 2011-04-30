(function() {
  'use strict';  var Cc, Ci, defer, extend, _ref;
  extend = require('../common').extend;
  defer = require('q').defer;
  _ref = require('chrome'), Cc = _ref.Cc, Ci = _ref.Ci;
  exports.request = function(options) {
    var body, deferred, header, headers, method, mimeType, password, uri, username, value, xhr;
    headers = options.headers, method = options.method, uri = options.uri, username = options.username, password = options.password, mimeType = options.mimeType, body = options.body;
    xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
    xhr.mozBackgroundRequest = true;
    xhr.open(method, String(uri), true, username, password);
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
    xhr.onreadystatechange = function() {
      var response;
      try {
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
      } catch (error) {
        return console.exception(error);
      }
    };
    xhr.send(body);
    deferred = defer();
    return deferred.promise;
  };
  extend(exports);
}).call(this);
