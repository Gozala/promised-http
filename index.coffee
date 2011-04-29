'use strict'

http = require 'http'
https = require 'https'
{ extend } = require './lib/common'
{ defer } = require 'q'

exports.request = (options)->
  { uri: { protocol }, body, onSuccess, onError } = options
  value = ''
  request = (if protocol is 'https:' then https else http).request options
  request.on 'response', (response)->
    response.on 'data', (chunk)-> value += chunk
    response.on 'end', -> deferred.resolve value
    response.on 'error', (error)-> deferred.reject error
  request.on 'error', (error)-> deferred.reject error
  request.write options.body if options.body
  request.end()
  
  deferred = defer()
  deferred.promise

extend exports
