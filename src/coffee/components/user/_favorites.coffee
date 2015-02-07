class EmojidexUserFavorites
  constructor: (@EC, token = null) ->
    @token = token
    @_favorites = @EC.Data.favorites()

  _favoritesApi: (options) ->
    if @token?
      $.ajax
        url: @EC.api_url + 'users/favorites'
        type: if options.type? then options.type else 'GET'
        dataType: 'json'
        data: options.data
        success: options.success

  get: (callback) ->
    options =
      data: auth_token: @token
      success: (response) =>
        @_favorites = @EC.Data.favorites response
        callback? @_favorites
    @_favoritesApi options

  set: (emoji_code) ->
    options =
      type: 'POST'
      data:
        auth_token: @token
        emoji_code: emoji_code
      success: (response) =>
        @_favorites.push response
        @EC.Data.favorites @_favorites
    @_favoritesApi options

  unset: (emoji_code) ->
    options =
      type: 'DELETE'
      data:
        auth_token: @token
        emoji_code: emoji_code
      success: (response) =>
        @sync()
    @_favoritesApi options

  sync: ->
    @get() # persistant favorites currently require an account

  all: ->
    @_favorites
