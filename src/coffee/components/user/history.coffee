class EmojidexUserHistory
  constructor: (shared = null, token = null) ->
    @S = shared || new EmojidexShared
    @token = token

  get: (opts) ->
    if @token?
      $.getJSON((@S.api_url +  'users/history?' + $.param({auth_token: @token})))
        .error (response) =>
          @history = []
        .success (response) =>
          @history = response

  set: (emoji_code) ->
    if @token?
      $.post(@S.api_url + 'users/history?' + \
        $.param({auth_token: @token, emoji_code: emoji_code}))

  sync: () ->
    if @token?
      $.getJSON((@S.api_url +  'users/history?' + $.param({auth_token: @token})))
        .success (response) =>
          remote = response.emoji
          local = @S.Data.history()
          # TODO

