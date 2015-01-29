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
      return true
    return false

  set: (emoji_code) ->
    if @token?
      $.ajax
        type: 'POST'
        url: @S.api_url + 'users/history'
        data:
          auth_token: @token
          emoji_code: emoji_code
        success: (response) =>
          for entry, i in @_history
            if entry.emoji_code == response.emoji_code
              @_history[i] = response
              @S.Data.history(@_history)
              return response
      return true
    return false

  sync: () ->
    @get() # history currently can't be saved locally, so only get will work
