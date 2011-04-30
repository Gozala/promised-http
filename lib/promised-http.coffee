'use strict'

{ extend } = require '../common'
{ defer } = require 'q'
{ Cc, Ci } = require 'chrome'

exports.request = (options)->
  { headers, method, uri, username, password, mimeType, body } = options
  xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest)
  xhr.mozBackgroundRequest = true
  xhr.open method, String(uri), true, username, password
  xhr.withCredentials = true if username and password
  for header, value of headers
    xhr.setRequestHeader header, value

  xhr.overrideMimeType mimeType if mimeType
  xhr.onreadystatechange = ->
    try
      if xhr.readyState is 4
        if xhr.status is 0 or xhr.status is 200
          if mimeType is 'xml'
            response = xhr.responseXML
          else
            response = xhr.responseText
          deferred.resolve response
        else
          deferred.reject
            at: 'request'
            message: 'Failure in XMLHttpRequest'
            request: xhr
    catch error
      console.exception error

  xhr.send body

  deferred = defer()
  deferred.promise

extend exports
