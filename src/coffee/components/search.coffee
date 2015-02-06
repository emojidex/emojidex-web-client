class EmojidexSearch
  constructor: (@EC) ->
    @Util = new EmojidexUtil
    @results = []
    @cur_page = 1
    @cur_limit = @EC.limit
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

  # Executes a general search (code_cont)
  search: (term, callback, opts) ->
    @next = ->
      @search(term, callback, $.extend(opts, {page: opts.page + 1}))

    unless @EC.closed_net
      opts = @_combine_opts(opts)
      opts = $.extend {}, code_cont: @EC.Util.escape_term(term), opts
      $.ajax
        url: @EC.api_url + 'search/emoji'
        dataType: 'json'
        data: opts
        success: (response) =>
          @_succeed response, callback
        error: (response) =>
          @results = []

    else
      @EC.Emoji.search(term, callback)

  # Executes a search starting with the given term
  starting: (term, callback = null, opts) ->
    @next = ->
      @starting(term, callback, $.extend(opts, {page: opts.page + 1}))

    unless @EC.closed_net
      opts = @_combine_opts(opts)
      opts = $.extend {}, {code_sw: @Util.escape_term(term)}, opts
      $.ajax
        url: @EC.api_url + 'search/emoji'
        dataType: 'json'
        data: opts
        success: (response) =>
          @_succeed response, callback
        error: (response) =>
          @results = []
    else
      @EC.Emoji.starting(term, callback)

  # Executes a search ending with the given term
  ending: (term, callback = null, opts) ->
    @next = () ->
      @ending(term, callback, $.extend(opts, {page: opts.page + 1}))

    unless @EC.closed_net
      opts = @_combine_opts(opts)
      opts = $.extend {}, {code_ew: @Util.escape_term(term)}, opts
      $.ajax
        url: @EC.api_url + 'search/emoji'
        dataType: 'json'
        data: opts
        success: (response) =>
          @_succeed response, callback
        error: (response) =>
          @results = []
    else
      @EC.Emoji.ending(term, callback)

  # Searches by tags
  tags: (tags, callback = null, opts) ->
    @next = ->
      @tags term, callback, $.extend(opts, {page: opts.page + 1})

    unless @EC.closed_net
      opts = @_combine_opts opts
      opts = $.extend {}, "tags[]": @Util.breakout(tags), opts
      $.ajax
        url: @EC.api_url + 'search/emoji'
        dataType: 'json'
        data: opts
        success: (response) =>
          @_succeed(response, callback)
        error: (response) =>
          @results = []
    else
      @EC.Emoji.tags tags

  # Searches using an array of keys and an array of tags
  advanced: (term, tags, categories, callback, opts) ->
    @next = ->
      @advanced(term, tags, categories, callback, $.extend(opts, {page: opts.page + 1}))
    unless @EC.closed_net
      params = code_cont: @Util.escape_term term
      params = $.extend params, "tags[]": @Util.breakout tags if tags.length > 0
      params = $.extend params, "categories[]": @Util.breakout categories if categories.length > 0

      opts = @_combine_opts opts
      opts = $.extend params, opts
      $.ajax
        url: @EC.api_url + 'search/emoji'
        dataType: 'json'
        data: opts
        success: (response) =>
          @_succeed response, callback
        error: (response) =>
          @results = []
    else
      @EC.Emoji.advanced term, tags, categories, callback

  # Combines opts against common defaults
  _combine_opts: (opts) ->
    $.extend {}, { page: 1, limit: @EC.limit, detailed: @EC.detailed }, opts

  # fills in @results, @cur_page, and @count and calls callback
  _succeed: (response, callback) ->
    @results = response.emoji
    @cur_page = response.meta.page
    @count = response.meta.count
    @EC.Emoji.combine(response.emoji)
    callback(response.emoji) if callback?
