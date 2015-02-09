class EmojidexSearch
  constructor: (@EC) ->
    @Util = new EmojidexUtil
    @results = []
    @cur_page = 1
    @count = 0

  _searchAPI: (search_data, callback, opts, func) ->
    param =
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed
    $.extend param, opts

    # TODO -------
    # @searched_func = unless @EC.closed_net then funx.ajax else func.storage
    @searched_func = func.ajax
    @searched =
      data: search_data
      callback: callback
      param: param

    unless @EC.closed_net
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
    else
      func.storage? search_data, callback

  # Executes a general search (code_cont)
  search: (term, callback, opts) ->
    opts = $.extend code_cont: @EC.Util.escape_term(term), opts
    @_searchAPI term, callback, opts, ajax: @search, storage: @EC.Emoji.search

  # Executes a search starting with the given term
  starting: (term, callback, opts) ->
    opts = $.extend code_sw: @Util.escape_term(term), opts
    @_searchAPI term, callback, opts, ajax: @starting, storage: @EC.Emoji.starting

  # Executes a search ending with the given term
  ending: (term, callback, opts) ->
    opts = $.extend code_ew: @Util.escape_term(term), opts
    @_searchAPI term, callback, opts, ajax: @ending, storage: @EC.Emoji.ending

  # Searches by tags
  tags: (tags, callback, opts) ->
    opts = $.extend "tags[]": @Util.breakout(tags), opts
    @_searchAPI tags, callback, opts, ajax: @tags, storage: @EC.Emoji.tags

  # Searches using an array of keys and an array of tags
  advanced: (searchs, callback, opts) ->
    param =
      code_cont: @Util.escape_term searchs.term
      "tags[]": @Util.breakout searchs.tags
      "categories[]": @Util.breakout searchs.categories
    $.extend param, opts
    @_searchAPI searchs, callback, param, ajax: @advanced, storage: @EC.Emoji.advanced

  next: ->
    @searched.param.page++ if @count is @searched.param.limit
    @searched_func @searched.data, @searched.callback, @searched.param, ajax: @searched_func

  prev: ->
    @searched.param.page-- if @searched.param.page > 1
    @searched_func @searched.data, @searched.callback, @searched.param, ajax: @searched_func
