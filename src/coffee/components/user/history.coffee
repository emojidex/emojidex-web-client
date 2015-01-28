class EmojidexUserHistory
  constructor: (shared = null, token = null) ->
    @S = shared || new EmojidexShared
    @token = token
    @_history = @S.Data.history()

  all: () ->
    @_history

  get: (opts) ->
    if @token?
      $.getJSON((@S.api_url +  'users/history?' + $.param({auth_token: @token})))
        .success (response) =>
          @_history = @S.Data.history(response)

  set: (emoji_code) ->
    if @token?
      $.ajax
        type: 'POST'
        url: @S.api_url + 'users/history'
        data:
          auth_token: @token
          emoji_code: emoji_code
        success: (response) =>
          @_history.push(emoji_code)
          @S.Data.history(@_history)

  sync: () ->
    if @token?
      $.getJSON((@S.api_url +  'users/history?' + $.param({auth_token: @token})))
        .success (response) =>
          # diff = @S.Data.history().filter(response)
          # TODO ローカルにあってリモートに無いのを送信する

