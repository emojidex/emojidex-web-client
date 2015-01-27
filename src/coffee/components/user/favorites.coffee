class EmojidexUserFavorites
  constructor: (shared = null, token = null) ->
    @S = shared || new EmojidexShared
    @token = token

  get: () ->
    if @token?
      $.ajax
        url: @S.api_url + 'users/favorites'
        data:
          auth_token: @token

        success: (response) ->
          @favorites = response

        error: (response) ->
          @favorites = []

  set: (emoji_code) ->
    if @token?
      $.ajax
        type: 'POST'
        url: @S.api_url + 'users/favorites'
        data:
          auth_token: @token
          emoji_code: emoji_code

        success: (response) ->
          # @get_favorites() # re-obtain favorites

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
          remote = response.emoji
          local = @S.Data.history()
          # TODO
