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
    if @EC.User.auth_info.token != null
      $.extend param, {auth_token: @EC.User.auth_info.token}
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
        if response.status?
          @results = []
          @cur_page = 0
          @count = 0
          callback? []
        else
          @results = response.emoji
          @cur_page = response.meta.page
          @count = response.meta.count
          @EC.Emoji.combine(response.emoji).then (data) ->
            callback? response.emoji
      error: (response) =>
        @results = []
        @cur_page = 0
        @count = 0
        callback? []

  index: (callback, opts) ->
    @_indexesAPI 'emoji', callback, opts, @index

  newest: (callback, opts) ->
    @_indexesAPI 'newest', callback, opts, @newest

  popular: (callback, opts) ->
    @_indexesAPI 'popular', callback, opts, @popular

  user: (username, callback, opts) ->
    @_indexesAPI "users/#{username}/emoji", callback, opts

  static: (static_type, language, callback) ->
    loaded_num = 0
    loaded_emoji = []

    loadStatic = (url_string) =>
      $.ajax
        url: url_string
        dataType: 'json'
        success: (response) =>
          loaded_emoji = loaded_emoji.concat response
          if ++loaded_num is static_type.length
            @EC.Emoji.combine(loaded_emoji).then (data) ->
              callback? data

    for type in static_type
      if language
        loadStatic "#{@EC.api_url + type}?locale=#{language}"
      else
        loadStatic "#{@EC.api_url + type}"

  select: (code, callback, opts) ->
    @EC.Search.find(code, callback, opts)

  next: ->
    @indexed.param.page++ if @count is @indexed.param.limit
    @indexed_func @indexed.callback, @indexed.param, @indexed_func

  prev: ->
    @indexed.param.page-- if @indexed.param.page > 1
    @indexed_func @indexed.callback, @indexed.param, @indexed_func
