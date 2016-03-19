class EmojidexDataStorage
  constructor: (@ED, hub_path) ->
    hub_path = hub_path ? 'https://www.emojidex.com/hub'
    @hub = new CrossStorageClient hub_path
    @update_cache()

  _get_chained_data: (query, data_obj) ->
    chain_obj = (data, key) ->
      if query.length is 0
        data[key] = data_obj
      else
        data[key] = {}
        chain_obj data[key], query.shift()
      return data

    if query.length
      return data_obj
    else
      return chain_obj {}, query.shift()

  _get_hub_data: (query) ->
    query = query.split '.'
    @hub.onConnect().then(=>
      @hub.get query.shift()
    ).then (hub_data)->
      if query.length
        for q in query
          hub_data = hub_data[q]
      return hub_data

  get: (query) ->
    cache = @ED.hub_data
    query = query.split '.'
    if query.length
      for q in query
        cache = cache[q]
    return cache

  _get_parsed_query: (query) ->
    parsed_query = query.split '.'
    query =
      origin: query
      first: parsed_query.shift()
      array: parsed_query

  set: (query, data) ->
    query = @_get_parsed_query query
    @hub.onConnect().then =>
      @hub.set query.first, @_get_chained_data query.array, data
      @update_cache()

  update: (query, data) ->
    query = @_get_parsed_query query
    merged = $.extend true, {}, @get(query.origin), @_get_chained_data(query.array, data)
    @set query, merged

  update_cache: ->
    @_get_hub_data('emojidex').then (hub_data) =>
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
