class EmojidexCategories
  constructor: (@EC) ->
    @_categories = @EC.Data.categories()

    cat = @EC.Data.categories()
    if cat is 0
      @sync()

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
