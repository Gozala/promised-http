'use strict'

{ parse, format } = require 'url'
{ parse, URL } = require 'url'
# workaround for jetpack
parse = URL if URL

POST = 'POST'
GET = 'GET'
PUT = 'PUT'
DELETE = 'DELETE'
HEAD = 'HEAD'

CONTENT_TYPE = 'Content-Type'
CONTENT_LENGTH = 'Content-Length'

CONTENT_URL_ENCODED = 'application/x-www-form-urlencoded'
CONTENT_JSON = 'application/json'
CONTENT_MULTIPART = 'multipart/related;boundary="frontier"'

# Turns an object into its URL-encoded query string representation.
toQuery = (data)->
  message = ''
  for key, value of data
    message += '&' + encodeURIComponent key
    message += '=' + encodeURIComponent value
  if message then message.substr 1 else message

# Turns an object to multiple part message with a single body
toMultiPart = (data)->
  message = ''
  for part in data
      { body } = part
      delete part.body
      message += "#{body}--frontier\r\n"
      for key, value of part
        message += "#{key}: #{value}\r\n"
      message += "\r\n #{body} \r\n"
    message += '--frontier--'
  message

# Normalize options passed to the request.
Options = (options)->
  options = { url: options } if typeof options is 'string'
  console.log options
  { headers, method, message, data, body, json, multipart, uri, url } = options

  # Normalizing `uri` property or falling back to `url` if not provided.
  uri = options.uri = url if not uri
  uri = options.uri = parse uri if typeof uri is 'string'
  url = options.url = format uri
  { port, hostname, host, protocol, pathname, query, hash } = uri

  secure = protocol is 'https:'

  path = options.path = if pathname then pathname else '/'
  host = options.host = hostname if not options.host

  # Falling back to 'GET' method if nothing is provided.
  method = options.method = GET if not method

  data = message if message and not data
  
  # If headers are not passed creating a defaults.
  options.headers = headers = {} if not headers
  headers.Host = host if not headers.Host
  headers.Host += ":#{port}" if port
  headers.Accept = '*/*' if not headers.Accept

  if json
    headers[CONTENT_TYPE] = CONTENT_JSON
    body = options.body = JSON.stringify json
  else if multipart
    headers[CONTENT_TYPE] = CONTENT_MULTIPART
    body = options.body = toMultiPart multipart
  else if data
    if method is GET
      uri = "#{uri.protocol}//#{uri.hostname}#{uri.pathname}?#{toQuery data}"
      uri = options.uri = parse uri
    else
      headers[CONTENT_TYPE] = CONTENT_URL_ENCODED
      body = options.body = toQuery data

  if body
    options.body = new Buffer body if not Buffer.isBuffer body

  headers[CONTENT_LENGTH] = body.length if body

  # Using `port` if provided or falling back to defaults if not.
  options.port = if port then port else if secure then 443 else 80
  options.path = "#{uri.pathname || '/'}#{uri.search || ''}"
  options

exports.extend = (exports)->
  request = exports.request
  
  exports.request = (options)->
    request Options(options)

  ###
       Just an alias of `request`.
  ###
  exports.get = (options)->
    exports.request Options(options)

  ###
     Shortcut for request with a 'POST' method.
     `post('http://foo.com') -> request({ uri: 'http://foo.com', method: 'POST' })
  ###

  exports.post = (options)->
    options = Options options
    options.method = POST
    exports.request options

  ###
     Shortcut for request with a 'PUT' method.
  ###
  exports.put = (options)->
    options = Options options
    options.method = PUT
    exports.request options

  ###
     Shortcut for request with a 'HEAD' method.
  ###
  exports.head = (options)->
    options = Options options
    options.method = HEAD
    exports.request options

  ###
     Shortcut for request with a 'DELETE' method.
  ###
  exports.del = exports.delete = (options)->
    options = Options options
    options.method = DELETE
    exports.request options

  exports
