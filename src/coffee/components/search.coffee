class EmojidexSearch
  constructor: (@EC) ->
    @Util = new EmojidexUtil
    @results = []
    @cur_page = 1
    @cur_limit = @EC.limit
    @count = 0

    # short-circuit next()
    @next = () ->
      null

  # Executes a general search (code_cont)
  search: (term, callback = null, opts) ->
    @next = () ->
      @search(term, callback, $.extend(opts, {page: opts.page + 1}))
    if !@EC.closed_net
      opts = @_combine_opts(opts)
      $.getJSON((@EC.api_url +  'search/emoji?' + $.param(($.extend {}, \
          {code_cont: @Util.escape_term(term)}, opts))))
        .error (response) =>
          @results = []
        .success (response) =>
          @_succeed(response, callback)
    else
      @EC.Emoji.search(term, callback)
    @EC.Emoji.search(term)

  # Executes a search starting with the given term
  starting: (term, callback = null, opts) ->
    @next = () ->
      @starting(term, callback, $.extend(opts, {page: opts.page + 1}))
    if !@EC.closed_net
      opts = @_combine_opts(opts)
      $.getJSON((@EC.api_url +  'search/emoji?' + $.param(($.extend {}, \
          {code_sw: @Util.escape_term(term)}, opts))))
        .error (response) =>
          @results = []
        .success (response) =>
          @_succeed(response, callback)
    else
      @EC.Emoji.starting(term, callback)
    @EC.Emoji.starting(term)

  # Executes a search ending with the given term
  ending: (term, callback = null, opts) ->
    @next = () ->
      @ending(term, callback, $.extend(opts, {page: opts.page + 1}))
    if !@EC.closed_net
      opts = @_combine_opts(opts)
      $.getJSON((@EC.api_url +  'search/emoji?' + $.param(($.extend {}, \
          {code_ew: @Util.escape_term(term)}, opts))))
        .error (response) =>
          @results = []
        .success (response) =>
          @_succeed(response, callback)
    else
      @EC.Emoji.ending(term, callback)
    @EC.Emoji.ending(term)

  # Searches by tags
  tags: (tags, callback = null, opts) ->
    @next = () ->
      @tags(term, callback, $.extend(opts, {page: opts.page + 1}))
    if !@EC.closed_net
      opts = @_combine_opts(opts)
      $.getJSON((@EC.api_url +  'search/emoji?' + $.param(($.extend {}, \
          {"tags[]": @Util.breakout(tags)}, opts))))
        .error (response) =>
          @results = []
        .success (response) =>
          @_succeed(response, callback)
    else
      @EC.Emoji.tags(tags, callback)
    @EC.Emoji.tags(tags)

  # Searches using an array of keys and an array of tags
  advanced: (term, tags = [], categories = [], callback = null, opts) ->
    @next = () ->
      @advanced(term, tags, categories, callback, $.extend(opts, {page: opts.page + 1}))
    if !@EC.closed_net
      opts = @_combine_opts(opts)
      params = {code_cont: @Util.escape_term(term)}
      params = $.extend(params, {"tags[]": @Util.breakout(tags)}) if tags.length > 0
      params = $.extend(params, {"categories[]": @Util.breakout(categories)}) if categories.length > 0
      $.getJSON((@EC.api_url +  'search/emoji?' + $.param(($.extend params, opts))))
        .error (response) =>
          @results = []
        .success (response) =>
          @_succeed(response, callback)
    else
      @EC.Emoji.advanced(term, tags, categories, callback)
    @EC.Emoji.advanced(term, tags, categories)

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
