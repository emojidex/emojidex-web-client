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
    console.log 'get---'
    query = query.split '.'
    @hub.onConnect().then(=>
      console.log 'get2---'
      @hub.get query[0]
    ).then (res) =>
      console.log res
      # if query.length
      #   for q in query
      #     data = data[q]
      # console.log data
      return res

  set: (query, data) ->
    @hub.set query.split('.')[0], @_get_query_data query, data

  update: (query, data) ->
    update_data = @hub.get query
    $.extend update_data, @_get_query_data(query, data)
    @hub.set query, update_data

  update_emojidex_data: ->
    @hub.get('emojidex').then (data) =>
      @ed.emojidex_data = data

  isEmpty: (query) ->
