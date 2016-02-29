class EmojidexDataStorage
  constructor: (@ed, hub_path) ->
    hub_path = hub_path ? 'https://www.emojidex.com/hub'
    @hub = new CrossStorageClient hub_path

  _get_query_data: (query, data_obj) ->
    query = query.split '.'
    data = {}
    if query.length
      for q, i in query
        data = data[q]
        if i + 1 is query.length
          data = data_obj
    return data

  get: (query) ->
    query = query.split '.'
    @hub.onConnect().then(=>
      @hub.get query.shift()
    ).then (hub_data)->
      if query.length
        for q in query
          hub_data = hub_data[q]
      console.log 'get --------'
      console.log hub_data
      return hub_data

  set: (query, data) ->
    @hub.onConnect().then =>
      @hub.set query.split('.')[0], @_get_query_data query, data

  update: (query, data) ->
    @get query, (hub_data) =>
      $.extend hub_data, @_get_query_data(query, data)
      @set query, hub_data

  update_emojidex_data: ->
    @hub.get('emojidex').then (data) =>
      @ed.emojidex_data = data

  clear: ->
    @hub.onConnect().then =>
      @hub.clear()

  isEmpty: (query, callback) ->
    @get(query).then (data)->
      console.log 'isEmpty --------'
      console.log data
      if data then false else true
