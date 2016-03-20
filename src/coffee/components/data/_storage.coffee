class EmojidexDataStorage
  constructor: (hub_path) ->
    hub_path = hub_path ? 'https://www.emojidex.com/hub'
    @hub = new CrossStorageClient hub_path
    @hub_cache = {}

  _get_chained_data: (query, data_obj, wrap=true) ->
    query = @_get_parsed_query query
    chain_obj = (data, key) ->
      if query.array.length is 0
        data[key] = data_obj
      else
        data[key] = {}
        chain_obj data[key], query.array.shift()
      return data

    chained = chain_obj {}, query.array.shift()
    return if wrap then chained else chained[query.first]

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
      array: parsed_query
      first: parsed_query[0]

  get: (query) ->
    query = if query instanceof Array then query else query.split('.')
    cache = @hub_cache
    if query.length
      for q in query
        cache = cache[q]
    return cache

  set: (query, data, update) ->
    first_query = query.split('.')[0]
    @hub.onConnect().then( =>
      if update
        new_data = {}
        new_data[first_query] = data
        return @hub.set first_query, new_data
      else
        return @hub.set first_query, @_get_chained_data query, data
    ).then =>
      @update_cache first_query

  update: (query, data) ->
    merged = $.extend true, {}, @get(query.split('.')[0]), @_get_chained_data(query, data, false)
    @set query, merged, true

  update_cache: (key) ->
    @hub.onConnect().then( =>
      if key then key else @hub.getKeys()
    ).then((keys) =>
      @hub.get keys
    ).then (hub_data) =>
      if key
        return @hub_cache[key] = hub_data[key]
      else
        return @hub_cache = hub_data

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
