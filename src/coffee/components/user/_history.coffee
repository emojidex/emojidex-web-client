class EmojidexUserHistory
  constructor: (@EC, token = null) ->
    @token = token
    @_history = @EC.Data.history()

  _historyAPI: (options) ->
    if @token?
      ajax_obj =
        url: @EC.api_url + 'users/history'
        dataType: 'json'
      $.ajax $.extend ajax_obj, options

  get: ->
    options =
      data: auth_token: @token
      success: (response) =>
        @_history = @EC.Data.history(response)
    @_historyAPI options

  set: (emoji_code) ->
    options =
      type: 'POST'
      data:
        auth_token: @token
        emoji_code: emoji_code
      success: (response) =>
        for entry, i in @_history
          if entry.emoji_code == response.emoji_code
            @_history[i] = response
            @EC.Data.history @_history
            return response
    @_historyAPI options

  sync: ->
    @get() # history currently can't be saved locally, so only get will work

  all: ->
    @_history
