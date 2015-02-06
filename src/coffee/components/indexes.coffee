class EmojidexIndexes
  constructor: (@EC) ->
    @results = []
    @cur_page = 1
    @cur_limit = @EC.limit
    @count = 0

  index: (callback, opts) ->
    @next = ->
      @index callback, $.extend(opts, page: opts.page + 1)

    opts = @_combine_opts(opts)
    $.ajax
      url: @EC.api_url + 'emoji'
      dataType: 'json'
      data: opts
      success: (response) =>
        @_succeed response, callback
      error: (response) =>
        @results = []

  newest: (callback, opts) ->
    @next = ->
      @newest callback, $.extend(opts, page: opts.page + 1)

    opts = @_combine_opts(opts)
    $.ajax
      url: @EC.api_url + 'newest'
      dataType: 'json'
      data: opts
      success: (response) =>
        @_succeed response, callback
      error: (response) =>
        @results = []

  popular: (callback, opts) ->
    @next = ->
      @popular callback, $.extend(opts, page: opts.page + 1)

    opts = @_combine_opts(opts)
    $.ajax
      url: @EC.api_url + 'popular'
      dataType: 'json'
      data: opts
      success: (response) =>
        @_succeed response, callback
      error: (response) =>
        @results = []

  user: (username, callback, opts) ->
    opts = @_combine_opts(opts)
    $.ajax
      url: @EC.api_url +  "users/#{username}/emoji"
      dataType: 'json'
      data: opts
      success: (response) =>
        @_succeed response, callback
      error: (response) =>
        @results = []

  # Combines opts against common defaults
  _combine_opts: (opts) ->
    $.extend
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed
      opts

  # fills in @results, @cur_page, and @count and calls callback
  _succeed: (response, callback) ->
    @results = response.emoji
    @cur_page = response.meta.page
    @count = response.meta.count
    @EC.Emoji.combine response.emoji
    callback? response.emoji