class EmojidexIndexes
  constructor: (shared = null, opts) ->
    @S = shared || new EmojidexShared
    @results = []
    @cur_page = 1
    @cur_limit = @S.limit
    @count = 0

  index: (callback = null, opts) ->
    @next = () ->
      @get_index(callback, $.extend(opts, {page: opts.page + 1}))
    opts = @_combine_opts(opts)
    $.getJSON((@S.api_url + '/emoji?' + $.param(opts)))
      .error (response) =>
        @results = []
      .success (response) =>
        @_succeed(response, callback)

  newest: (callback = null, opts) ->
    @next = () ->
      @get_newest(callback, $.extend(opts, {page: opts.page + 1}))
    opts = @_combine_opts(opts)
    $.getJSON((@S.api_url + '/newest?' + $.param(opts)))
      .error (response) =>
        @results = []
      .success (response) =>
        @_succeed(response, callback)

  popular: (callback = null, opts) ->
    @next = () ->
      @get_popular(callback, $.extend(opts, {page: opts.page + 1}))
    opts = @_combine_opts(opts)
    $.getJSON((@S.api_url + '/popular?' + $.param(opts)))
      .error (response) =>
        @results = []
      .success (response) =>
        @_succeed(response, callback)

  user: (username, callback = null, opts) ->
    opts = @_combine_opts(opts)
    $.ajax
      url: @S.api_url +  "users/#{username}/emoji"
      dataType: 'json'
      data: opts

      success: (response) =>
        @_succeed(response, callback)

      error: (response) =>
        @results = []

  # Combines opts against common defaults
  _combine_opts: (opts) ->
    $.extend { page: 1, limit: @S.limit, detailed: @S.detailed }, opts

  # fills in @results, @cur_page, and @count and calls callback
  _succeed: (response, callback) ->
    @results = response.emoji
    @cur_page = response.meta.page
    @count = response.meta.count
    @S.Emoji.combine(response.emoji)
    callback(response.emoji) if callback
