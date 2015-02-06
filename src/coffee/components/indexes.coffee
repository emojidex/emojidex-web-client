class EmojidexIndexes
  constructor: (@EC) ->
    @results = []
    @cur_page = 1
    @count = 0

  _getEmojiUseAjax_setNextAndPrev: (query, callback, opts, func) ->
    if func?
      @next = ->
        opts.page++
        func callback, opts
      @prev = ->
        opts.page-- if opts.page > 1
        func callback, opts

    default_params =
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed

    $.ajax
      url: @EC.api_url + query
      dataType: 'json'
      data: $.extend {}, default_params, opts

      success: (response) =>
        @results = response.emoji
        @cur_page = response.meta.page
        @count = response.meta.count
        @EC.Emoji.combine response.emoji
        callback? response.emoji

      error: (response) =>
        @results = []

  index: (callback, opts) ->
    @_getEmojiUseAjax_setNextAndPrev 'emoji', callback, opts, @index

  newest: (callback, opts) ->
    @_getEmojiUseAjax_setNextAndPrev 'newest', callback, opts, @newest

  popular: (callback, opts) ->
    @_getEmojiUseAjax_setNextAndPrev 'popular', callback, opts, @popular

  user: (username, callback, opts) ->
    @_getEmojiUseAjax_setNextAndPrev "users/#{username}/emoji", callback, opts
