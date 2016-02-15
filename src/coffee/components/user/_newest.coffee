class EmojidexUserNewest
  constructor: (@EC, token = null) ->
    @token = token

  _newestAPI: (options) ->
    if @token?
      ajax_obj =
        url: @EC.api_url + 'newest'
        dataType: 'json'
      $.ajax $.extend ajax_obj, options

  get: (callback) ->
    options =
      data:
        auth_token: @token
      success: (response) =>
        callback? response
      error: (response) =>
        callback? response
    @_newestAPI options
