class EmojidexSearch
  constructor: (@EC) ->
    @Util = new EmojidexUtil
    @results = []
    @cur_page = 1
    @count = 0

  _searchAPI: (search_data, callback, opts, call_func) ->
    param =
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed
    if @EC.User.auth_info.token != null
      $.extend param, {auth_token: @EC.User.auth_info.token}
    $.extend param, opts

    # TODO -------
    # @searched_func = unless @EC.closed_net then funx.ajax else call_func.storage
    @searched_func = call_func.ajax
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
          @meta = response.meta
          @results = response.emoji
          @cur_page = response.meta.page
          @count = response.meta.count
          @EC.Emoji.combine(response.emoji).then (data) ->
            callback? response.emoji
        error: (response) =>
          @results = []
    else
      call_func.storage? search_data, callback

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
  advanced: (search_details, callback, opts) ->
    param =
      code_cont: @Util.escape_term search_details.term
      "tags[]": @Util.breakout search_details.tags
      "categories[]": @Util.breakout search_details.categories
    $.extend param, opts
    @_searchAPI search_details, callback, param, ajax: @advanced, storage: @EC.Emoji.advanced

  # Not an actual search, just gets information on the given emoji
  find: (code, callback, opts) ->
    param =
      detailed: @EC.detailed
    $.extend param, opts

    if @EC.closed_net
      # TODO
    else
      $.ajax
        url: @EC.api_url + "/emoji/#{code}"
        dataType: 'json'
        data: param
        success: (response) =>
          @EC.Emoji.combine([response]).then (data) ->
            callback? response

  next: ->
    @searched.param.page++ if @count is @searched.param.limit
    @searched_func @searched.data, @searched.callback, @searched.param, ajax: @searched_func

  prev: ->
    @searched.param.page-- if @searched.param.page > 1
    @searched_func @searched.data, @searched.callback, @searched.param, ajax: @searched_func
