class EmojidexCategories
  constructor: (@EC) ->
    @_categories = @EC.Data.categories()

    cat = @EC.Data.categories()
    if cat is 0
      @sync()

  _categoriesAPI: (category_name, callback, opts, called_func) ->
    param =
      page: 1
      limit: @EC.limit
      detailed: @EC.detailed
    $.extend param, opts

    @called_func = called_func
    @called_data =
      category_name: category_name
      callback: callback
      param: param

    $.ajax
      url: "#{@EC.api_url}categories/#{category_name}/#{param.type}"
      dataType: 'json'
      data: param
      success: (response) =>
        @meta = response.meta
        @results = response.emoji
        @cur_page = response.meta.page
        @count = response.meta.count
        @EC.Emoji.combine response.emoji
        callback? response.emoji

  getEmoji: (category_name, callback, opts)->
    param =
      type: 'emoji'
    $.extend param, opts
    @_categoriesAPI category_name, callback, param, @getEmoji

  next: ->
    @called_data.param.page++ if @count is @called_data.param.limit
    @called_func @called_data.category_name, @called_data.callback, @called_data.param, ajax: @called_func

  prev: ->
    @called_data.param.page-- if @called_data.param.page > 1
    @called_func @called_data.category_name, @called_data.callback, @called_data.param, ajax: @called_func

  # Gets the full list of caetgories available
  sync: (callback, locale) ->
    locale ?= @EC.locale
    $.ajax
      url: @EC.api_url + 'categories'
      dataType: 'json'
      data:
        locale: locale
      success: (response) =>
        @_categories
        callback? response.categories

  all: ->
    @_categories
