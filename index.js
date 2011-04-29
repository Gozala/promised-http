(function() {
  'use strict';  var defer, extend, http, https;
  http = require('http');
  https = require('https');
  extend = require('./lib/common').extend;
  defer = require('q').defer;
  exports.request = function(options) {
    var body, deferred, onError, onSuccess, protocol, request, value;
    protocol = options.uri.protocol, body = options.body, onSuccess = options.onSuccess, onError = options.onError;
    value = '';
    request = (protocol === 'https:' ? https : http).request(options);
    request.on('response', function(response) {
      response.on('data', function(chunk) {
        return value += chunk;
      });
      response.on('end', function() {
        return deferred.resolve(value);
      });
      return response.on('error', function(error) {
        return deferred.reject(error);
      });
    });
    request.on('error', function(error) {
      return deferred.reject(error);
    });
    if (options.body) {
      request.write(options.body);
    }
    request.end();
    deferred = defer();
    return deferred.promise;
  };
  extend(exports);
}).call(this);
