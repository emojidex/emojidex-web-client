class EmojidexDataStorage
  constructor: (@ed, hub_path) ->
    hub_path = hub_path ? 'https://www.emojidex.com/hub'
    @hub = new CrossStorageClient hub_path

  _get_filtered_data: (query, data_obj) ->
    chain_obj = (data, key) ->
      if query.length is 0
        data[key] = data_obj
      else
        data[key] = {}
        chain_obj data[key], query.shift()
      return data

    query = query.split('.')
    if query.length is 1
      data_obj
    else
      query.shift()
      chain_obj {}, query.shift()

  get: (query) ->
    query = query.split '.'
    @hub.onConnect().then(=>
      @hub.get query.shift()
    ).then (hub_data)->
      if query.length
        for q in query
          hub_data = hub_data[q]
      return hub_data

  set: (query, data) ->
    @hub.onConnect().then =>
      @hub.set query.split('.')[0], @_get_filtered_data query, data
      @update_cache()

  update: (query, data) ->
    @get(query).then (hub_data) =>
      merged = $.extend true, {}, hub_data, @_get_filtered_data(query, data)
      @set query, merged

  update_cache: ->
    @get('emojidex').then (hub_data) =>
      @ed.hub_data = hub_data

  remove: (query) ->
    console.log 'remove--------'


  clear: ->
    @hub.onConnect().then =>
      @hub.clear()

  keys: (query) ->
    if query
      @get(query).then (hub_data)->
        keys = []
        for data of hub_data
          keys.push data
        return keys

    else
      @hub.onConnect().then =>
        @hub.getKeys()

  isEmpty: (query) ->
    @get(query).then (data) ->
      if data then false else true

  isSet: (query) ->
    @get(query).then (data) ->
      if data then true else false
