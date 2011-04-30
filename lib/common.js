(function() {
  'use strict';  var CONTENT_JSON, CONTENT_LENGTH, CONTENT_MULTIPART, CONTENT_TYPE, CONTENT_URL_ENCODED, DELETE, GET, HEAD, Options, POST, PUT, URL, parse, toMultiPart, toQuery, _ref;
  _ref = require('url'), parse = _ref.parse, URL = _ref.URL;
  if (URL) {
    parse = URL;
  }
  POST = 'POST';
  GET = 'GET';
  PUT = 'PUT';
  DELETE = 'DELETE';
  HEAD = 'HEAD';
  CONTENT_TYPE = 'Content-Type';
  CONTENT_LENGTH = 'Content-Length';
  CONTENT_URL_ENCODED = 'application/x-www-form-urlencoded';
  CONTENT_JSON = 'application/json';
  CONTENT_MULTIPART = 'multipart/related;boundary="frontier"';
  toQuery = function(data) {
    var key, message, value;
    message = '';
    for (key in data) {
      value = data[key];
      message += '&' + encodeURIComponent(key);
      message += '=' + encodeURIComponent(value);
    }
    if (message) {
      return message.substr(1);
    } else {
      return message;
    }
  };
  toMultiPart = function(data) {
    var body, key, message, part, value, _i, _len;
    message = '';
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      part = data[_i];
      body = part.body;
      delete part.body;
      message += "" + body + "--frontier\r\n";
      for (key in part) {
        value = part[key];
        message += "" + key + ": " + value + "\r\n";
      }
      message += "\r\n " + body + " \r\n";
    }
    message += '--frontier--';
    return message;
  };
  Options = function(options) {
    var body, data, hash, headers, host, hostname, json, message, method, multipart, path, pathname, port, protocol, query, secure, uri, url;
    if (typeof options === 'string') {
      options = {
        url: options
      };
    }
    headers = options.headers, method = options.method, message = options.message, data = options.data, body = options.body, json = options.json, multipart = options.multipart, uri = options.uri, url = options.url;
    if (!uri) {
      uri = options.uri = url;
    }
    if (typeof uri === 'string') {
      uri = options.uri = parse(uri);
    }
    port = uri.port, hostname = uri.hostname, host = uri.host, protocol = uri.protocol, pathname = uri.pathname, query = uri.query, hash = uri.hash;
    secure = protocol === 'https:';
    path = options.path = pathname ? pathname : '/';
    if (!host) {
      host = options.host = hostname;
    }
    if (!method) {
      method = options.method = GET;
    }
    if (message && !data) {
      data = message;
    }
    if (!headers) {
      options.headers = headers = {};
    }
    if (!headers.Host) {
      headers.Host = host;
    }
    if (host && port) {
      headers.Host += ":" + port;
    }
    if (!headers.Accept) {
      headers.Accept = '*/*';
    }
    if (json) {
      headers[CONTENT_TYPE] = CONTENT_JSON;
      body = options.body = JSON.stringify(json);
    } else if (multipart) {
      headers[CONTENT_TYPE] = CONTENT_MULTIPART;
      body = options.body = toMultiPart(multipart);
    } else if (data) {
      if (method === GET) {
        uri = "" + uri.protocol + "//" + uri.hostname + uri.pathname + "?" + (toQuery(data));
        uri = options.uri = parse(uri);
      } else {
        headers[CONTENT_TYPE] = CONTENT_URL_ENCODED;
        body = options.body = toQuery(data);
      }
    }
    if (body) {
      if (!Buffer.isBuffer(body)) {
        options.body = new Buffer(body);
      }
    }
    if (body) {
      headers[CONTENT_LENGTH] = body.length;
    }
    options.port = port ? port : secure ? 443 : 80;
    options.path = "" + (uri.pathname || '/') + (uri.search || '');
    return options;
  };
  exports.extend = function(exports) {
    var request;
    request = exports.request;
    exports.request = function(options) {
      return request(Options(options));
    };
    /*
         Just an alias of `request`.
    */
    exports.get = function(options) {
      return exports.request(Options(options));
    };
    /*
       Shortcut for request with a 'POST' method.
       `post('http://foo.com') -> request({ uri: 'http://foo.com', method: 'POST' })
    */
    exports.post = function(options) {
      options = Options(options);
      options.method = POST;
      return exports.request(options);
    };
    /*
       Shortcut for request with a 'PUT' method.
    */
    exports.put = function(options) {
      options = Options(options);
      options.method = PUT;
      return exports.request(options);
    };
    /*
       Shortcut for request with a 'HEAD' method.
    */
    exports.head = function(options) {
      options = Options(options);
      options.method = HEAD;
      return exports.request(options);
    };
    /*
       Shortcut for request with a 'DELETE' method.
    */
    exports.del = exports["delete"] = function(options) {
      options = Options(options);
      options.method = DELETE;
      return exports.request(options);
    };
    return exports;
  };
}).call(this);
