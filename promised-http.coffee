'use strict'

{ defer } = require 'q'
{ parse: parseURI } = require 'url'
http = require 'http'
https = require 'https'

POST = 'POST'
GET = 'GET'

toQuery = (data) ->
  message = ''
  for key, value of data
    message += '&' + encodeURIComponent key
    message += '=' + encodeURIComponent value
  message

toMultiPart = (data) ->
  string = ''
  for part in data
      { body } = part
      delete part.body
      string += "#{body}--frontier\r\n"
      for key, value of part
        string += "#{key}: #{value}\r\n"
      string += "\r\n #{body} \r\n"
    string += '--frontier--'
  string

Options = (options) ->
  if typeof options is 'string' then uri: options else options

###
   Just an alias of `request`.
###
exports.get = (options) ->
  exports.request options

###
   Shortcut for request
   `post('http://foo.com') -> request({ uri: 'http://foo.com', method: 'POST' })
###

exports.post = (options) ->
  options = Options options
  options.method = POST
  exports.request options

###
   Shortcut for request
###
exports.put = (options) ->
  options = Options options
  options.method = 'PUT'
  exports.request options

###
   Shortcut for request
###
exports.head = (options) ->
  options = Options options
  options.method = 'HEAD'
  exports.request options

###
   Shortcut for request
###
exports.del = exports.delete = (options) ->
  options = Options options
  options.method = 'DELETE'
  exports.request options

exports.request = (options) ->
  options = Options(options)
  { headers, method, message, data, body, json, multipart, uri, url } = options

  # Normalizing `uri` property or falling back to `url` if not provided.
  uri = url if url and not uri
  uri = options.uri = if typeof uri is 'string' then parseURI uri else uri
  console.log uri
  { port, hostname, host, protocol, pathname, query, hash } = uri

  path = options.path = if pathname then pathname else '/'
  host = options.host = hostname if not options.host

  # Depending on connection type we will have to do different things so we
  # analyze if it's 'https' here.
  secure = if protocol is 'https:' then yes else no
  
  # Falling back to 'GET' method if nothing is provided.
  method = options.method = GET if not method

  data = message if message and not data
  
  # If headers are not passed creating a defaults.
  options.headers = headers = {} if not headers
  headers.host = host if not headers.host
  headers.host += ":#{port}" if port
  headers.accept = '*/*' if not headers.accept

  if json
    headers['content-type'] = 'application/json'
    body = options.body = JSON.stringify json
  else if multipart
    headers['content-type'] = 'multipart/related;boundary="frontier"'
    body = options.body = toMultiPart multipart
  else if data
    headers['content-type'] = 'application/x-www-form-urlencoded'
    body = options.body = toQuery data

  if body
    options.body = new Buffer body if not Buffer.isBuffer body

  headers['content-length'] = if body then body.length else 0

  # Using `port` if provided or falling back to defaults if not.
  options.port = if port then port else if secure then 443 else 80

  value = ''
  request = (if secure then https else http).request options
  request.on 'response', (response) ->
    response.on 'data', (chunk) -> value += chunk
    response.on 'end', () -> deferred.resolve value

  request.write options.body if options.body
  request.end()

  deferred = defer()
  deferred.promise
