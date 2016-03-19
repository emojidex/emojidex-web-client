class EmojidexUserFavorites
  constructor: (@EC, token) ->
    @token = token
    @_favorites = @EC.Data.favorites()

  _favoritesAPI: (options) ->
    if @token?
      ajax_obj =
        url: @EC.api_url + 'users/favorites'
        dataType: 'json'
      $.ajax $.extend ajax_obj, options

  get: (callback) ->
    options =
      data:
        auth_token: @token
      success: (response) =>
        @_favorites = response
        @EC.Data.favorites response
        callback? @_favorites
    @_favoritesAPI options

  set: (emoji_code) ->
    options =
      type: 'POST'
      data:
        auth_token: @token
        emoji_code: emoji_code
      success: (response) =>
        @_favorites.push response
        @EC.Data.favorites @_favorites
    @_favoritesAPI options

  unset: (emoji_code) ->
    options =
      type: 'DELETE'
      data:
        auth_token: @token
        emoji_code: emoji_code
      success: (response) =>
        @sync()
    @_favoritesAPI options

  sync: ->
    @get() # persistant favorites currently require an account

  all: (callback) ->
    if @_favorites?
      callback? @_favorites
    else
      setTimeout (=>
        @all callback
      ), 500
