class EmojidexUserPopular
  constructor: (@EC, token) ->
    @token = token

  _popularAPI: (options) ->
    if @token?
      ajax_obj =
        url: @EC.api_url + 'popular'
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
    @_popularAPI options
