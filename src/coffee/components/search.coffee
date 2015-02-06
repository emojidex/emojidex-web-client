class EmojidexSearch
  constructor: (@EC) ->
    @Util = new EmojidexUtil
    @results = []
    @cur_page = 1
    @count = 0

  next: ->
    @searched.param.page++ if @count is @searched.param.limit
    @searched_func @searched.data, @searched.callback, @searched.param, @searched_func
  prev: ->
    @searched.param.page-- if @searched.param.page > 1
    @searched_func @searched.data, @searched.callback, @searched.param, @searched_func

  _getEmojiUseAjax: (search_data, callback, opts, func) ->
    param =
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed
    $.extend param, opts

    if func?
      @searched_func = func
      @searched =
        data: search_data
        callback: callback
        param: param

    $.ajax
      url: @EC.api_url + 'search/emoji'
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

  # Executes a general search (code_cont)
  search: (term, callback, opts) ->
    unless @EC.closed_net
      opts = $.extend code_cont: @EC.Util.escape_term(term), opts
      @_getEmojiUseAjax term, callback, opts, @search
    else
      @EC.Emoji.search term, callback

  # Executes a search starting with the given term
  starting: (term, callback, opts) ->
    unless @EC.closed_net
      opts = $.extend code_sw: @Util.escape_term(term), opts
      @_getEmojiUseAjax term, callback, opts, @starting
    else
      @EC.Emoji.starting term, callback

  # Executes a search ending with the given term
  ending: (term, callback, opts) ->
    unless @EC.closed_net
      opts = $.extend {}, {code_ew: @Util.escape_term(term)}, opts
      @_getEmojiUseAjax term, callback, opts, @ending
    else
      @EC.Emoji.ending term, callback

  # Searches by tags
  tags: (tags, callback, opts) ->
    unless @EC.closed_net
      opts = $.extend {}, "tags[]": @Util.breakout(tags), opts
      @_getEmojiUseAjax tags, callback, opts, @tags
    else
      @EC.Emoji.tags tags

  # Searches using an array of keys and an array of tags
  advanced: (searchs, callback, opts) ->
    unless @EC.closed_net
      params = code_cont: @Util.escape_term searchs.term
      params = $.extend params, "tags[]": @Util.breakout searchs.tags if searchs.tags?
      params = $.extend params, "categories[]": @Util.breakout searchs.categories if searchs.categories?
      opts = $.extend params, opts
      @_getEmojiUseAjax searchs, callback, opts, @advanced
    else
      @EC.Emoji.advanced searchs
