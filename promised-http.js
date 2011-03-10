'use strict';var GET, Options, POST, defer, http, https, parseURI, toMultiPart, toQuery;
defer = require('q').defer;
parseURI = require('url').parse;
http = require('http');
https = require('https');
POST = 'POST';
GET = 'GET';
toQuery = function(data) {
  var key, message, value;
  message = '';
  for (key in data) {
    value = data[key];
    message += '&' + encodeURIComponent(key);
    message += '=' + encodeURIComponent(value);
  }
  return message;
};
toMultiPart = function(data) {
  var body, key, part, string, value, _i, _len;
  string = '';
  for (_i = 0, _len = data.length; _i < _len; _i++) {
    part = data[_i];
    body = part.body;
    delete part.body;
    string += "" + body + "--frontier\r\n";
    for (key in part) {
      value = part[key];
      string += "" + key + ": " + value + "\r\n";
    }
    string += "\r\n " + body + " \r\n";
  }
  string += '--frontier--';
  return string;
};
Options = function(options) {
  if (typeof options === 'string') {
    return {
      uri: options
    };
  } else {
    return options;
  }
};
/*
   Just an alias of `request`.
*/
exports.get = function(options) {
  return exports.request(options);
};
/*
   Shortcut for request
   `post('http://foo.com') -> request({ uri: 'http://foo.com', method: 'POST' })
*/
exports.post = function(options) {
  options = Options(options);
  options.method = POST;
  return exports.request(options);
};
/*
   Shortcut for request
*/
exports.put = function(options) {
  options = Options(options);
  options.method = 'PUT';
  return exports.request(options);
};
/*
   Shortcut for request
*/
exports.head = function(options) {
  options = Options(options);
  options.method = 'HEAD';
  return exports.request(options);
};
/*
   Shortcut for request
*/
exports.del = exports["delete"] = function(options) {
  options = Options(options);
  options.method = 'DELETE';
  return exports.request(options);
};
exports.request = function(options) {
  var body, data, deferred, hash, headers, host, hostname, json, message, method, multipart, path, pathname, port, protocol, query, request, secure, uri, url, value;
  options = Options(options);
  headers = options.headers, method = options.method, message = options.message, data = options.data, body = options.body, json = options.json, multipart = options.multipart, uri = options.uri, url = options.url;
  if (url && !uri) {
    uri = url;
  }
  uri = options.uri = typeof uri === 'string' ? parseURI(uri) : uri;
  console.log(uri);
  port = uri.port, hostname = uri.hostname, host = uri.host, protocol = uri.protocol, pathname = uri.pathname, query = uri.query, hash = uri.hash;
  path = options.path = pathname ? pathname : '/';
  if (!options.host) {
    host = options.host = hostname;
  }
  secure = protocol === 'https:' ? true : false;
  if (!method) {
    method = options.method = GET;
  }
  if (message && !data) {
    data = message;
  }
  if (!headers) {
    options.headers = headers = {};
  }
  if (!headers.host) {
    headers.host = host;
  }
  if (port) {
    headers.host += ":" + port;
  }
  if (!headers.accept) {
    headers.accept = '*/*';
  }
  if (json) {
    headers['content-type'] = 'application/json';
    body = options.body = JSON.stringify(json);
  } else if (multipart) {
    headers['content-type'] = 'multipart/related;boundary="frontier"';
    body = options.body = toMultiPart(multipart);
  } else if (data) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    body = options.body = toQuery(data);
  }
  if (body) {
    if (!Buffer.isBuffer(body)) {
      options.body = new Buffer(body);
    }
  }
  headers['content-length'] = body ? body.length : 0;
  options.port = port ? port : secure ? 443 : 80;
  value = '';
  request = (secure ? https : http).request(options);
  request.on('response', function(response) {
    response.on('data', function(chunk) {
      return value += chunk;
    });
    return response.on('end', function() {
      return deferred.resolve(value);
    });
  });
  if (options.body) {
    request.write(options.body);
  }
  request.end();
  deferred = defer();
  return deferred.promise;
};