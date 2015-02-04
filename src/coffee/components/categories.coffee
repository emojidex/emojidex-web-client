class EmojidexCategories
  constructor: (@EC) ->
    @_categories = @EC.Data.categories()

    cat = @EC.Data.categories()
    if cat is 0
      @sync()

  # Gets the full list of caetgories available
  sync: (callback, locale) ->
    locale = @EC.locale unless locale?
    $.ajax
      url: @EC.api_url +  'categories'
      dataType: 'json'
      data:
        locale: locale

      success: (response) =>
        @_categories
        callback(response.categories) if callback?

  all: () ->
    @_categories
