'use strict'

{ extend } = require '../common'
{ defer } = require 'q'
{ XMLHttpRequest } = require 'xhr'

exports.request = (options)->
  { headers, method, url, username, password, mimeType, body } = options
  @content = ''
  @xhr = new XMLHttpRequest
  @xhr.open method, url, true, username, password
  @xhr.withCredentials = true if username and password
  for header, value of headers
    @xhr.setRequestHeader header, value
  @xhr.overrideMimeType mimeType if mimeType

  @xhr.onreadystatechange = =>
    if @xhr.readyState is 4
      if @xhr.status is 0 or xhr.status is 200
        if mimeType is 'xml'
          response = @xhr.responseXML
        else
          response = @xhr.responseText
        deferred.resolve response
      else
        deferred.reject
          at: 'request'
          message: 'Failure in XMLHttpRequest'
          request: @xhr

  @xhr.send body

  deferred = defer()
  deferred.promise

extend exports
