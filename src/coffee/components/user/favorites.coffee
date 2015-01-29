class EmojidexUserFavorites
  constructor: (shared = null, token = null) ->
    @S = shared || new EmojidexShared
    @token = token
    @_favorites = @S.Data.favorites()

  all: () ->
    @_favorites

  get: () ->
    if @token?
      $.getJSON((@S.api_url +  'users/favorites?' + $.param({auth_token: @token})))
        .success (response) =>
          @_favorites = @S.Data.favorites(response)
      return true
    return false

  set: (emoji_code) ->
    if @token?
      $.ajax
        type: 'POST'
        url: @S.api_url + 'users/favorites'
        data:
          auth_token: @token
          emoji_code: emoji_code
        success: (response) =>
          @_favorites.push(response)
          @S.Data.favorites(@_favorites)
      return true
    return false

  unset: (emoji_code) ->
    if @token?
      $.ajax
        type: 'DELETE'
        url: @S.api_url + 'users/favorites'
        data:
          auth_token: @token
          emoji_code: emoji_code
        success: (response) =>
          @sync()
      return true
    return false

  sync: () ->
    @get() # persistant favorites currently require an account