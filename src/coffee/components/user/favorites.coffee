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

  set: (emoji_code) ->
    if @token?
      $.ajax
        type: 'POST'
        url: @S.api_url + 'users/favorites'
        data:
          auth_token: @token
          emoji_code: emoji_code
        success: (response) =>
          @_favorites.push(emoji_code)
          @S.Data.favorites(@_favorites)

  unset: (emoji_code) ->
    if @token?
      $.ajax
        type: 'DELETE'
        url: @S.api_url + 'users/favorites'
        data:
          auth_token: @token
          emoji_code: emoji_code

        success: (response) ->
          # @get_favorites()

  sync: () ->
    if @token?
      $.getJSON((@S.api_url +  'users/history?' + $.param({auth_token: @token})))
        .success (response) =>
          # TODO ローカルにあってリモートに無いのを送信する
