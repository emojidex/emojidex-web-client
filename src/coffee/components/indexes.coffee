class EmojidexIndexes
  constructor: (@EC) ->
    @results = []
    @cur_page = 1
    @count = 0

  _indexesAPI: (query, callback, opts, func) ->
    param =
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed
    $.extend param, opts

    if func?
      @indexed_func = func
      @indexed =
        query: query
        callback: callback
        param: param

    $.ajax
      url: @EC.api_url + query
      dataType: 'json'
      data: param
      success: (response) =>
        @results = response.emoji
        @cur_page = response.meta.page
        @count = response.meta.count
        @EC.Emoji.combine response.emoji
        callback? response.emoji
      error: (response) =>
        @results = []

  index: (callback, opts) ->
    @_indexesAPI 'emoji', callback, opts, @index

  newest: (callback, opts) ->
    @_indexesAPI 'newest', callback, opts, @newest

  popular: (callback, opts) ->
    @_indexesAPI 'popular', callback, opts, @popular

  user: (username, callback, opts) ->
    @_indexesAPI "users/#{username}/emoji", callback, opts

  select: (code, callback, opts) ->
    @EC.Search.find(code, callback, opts)

  next: ->
    @indexed.param.page++ if @count is @indexed.param.limit
    @indexed_func @indexed.data, @indexed.callback, @indexed.param, @indexed_func

  prev: ->
    @indexed.param.page-- if @indexed.param.page > 1
    @indexed_func @indexed.data, @indexed.callback, @indexed.param, @indexed_func
