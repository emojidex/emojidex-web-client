class EmojidexDataStorage
  constructor: (@ED, hub_path) ->
    hub_path = hub_path ? 'https://www.emojidex.com/hub'
    @hub = new CrossStorageClient hub_path

  _get_chained_data: (query, data_obj) ->
    chain_obj = (data, key) ->
      if query.length is 0
        data[key] = data_obj
      else
        data[key] = {}
        chain_obj data[key], query.shift()
      return data

    if query.length
      return chain_obj {}, query.shift()
    else
      return data_obj

  _get_hub_data: (query) ->
    query = query.split '.'
    @hub.onConnect().then(=>
      @hub.get query.shift()
    ).then (hub_data)->
      if query.length
        for q in query
          hub_data = hub_data[q]
      return hub_data

  _get_parsed_query: (query) ->
    parsed_query = query.split '.'
    query =
      code: query
      origin: parsed_query
      first: parsed_query[0]
      after_first: parsed_query.slice 1

  get: (query, wrap) ->
    query = if query instanceof Array then query else query.split('.')
    cache = @ED.hub_data
    if query.length
      for q in query
        cache = cache[q]
    re = {}
    if wrap
      re[query[0]] = cache
    else
      re = cache
    return re

  set: (query, data) ->
    query = @_get_parsed_query query
    @hub.onConnect().then( =>
      @hub.set query.first, @_get_chained_data query.after_first, data
    ).then =>
      @update_cache query.first

  update: (query, data) ->
    query = @_get_parsed_query query
    merged = $.extend true, {}, @get(query.origin, true), @_get_chained_data(query.origin, data)
    @set query.code, merged

  update_cache: (key) ->
    @hub.onConnect().then( =>
      if key then key else @hub.getKeys()
    ).then((keys) =>
      @hub.get keys
    ).then (hub_data) =>
      if key
        @ED.hub_data[key] = hub_data[key]
      else
        @ED.hub_data = hub_data

  remove: (query) ->
    console.log 'remove--------'

  clear: ->
    @hub.onConnect().then =>
      @hub.clear()

  keys: (query) ->
    if query
      keys = []
      for key of @get(query)
        keys.push key
      return keys

    else
      @hub.onConnect().then =>
        @hub.getKeys()

  isEmpty: (query) ->
    if @get(query) then false else true

  isSet: (query) ->
    if @get(query) then true else false
