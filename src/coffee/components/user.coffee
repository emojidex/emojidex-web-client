class EmojidexUser
  constructor: (@EC) ->
    @auth_info = @EC.Data._def_auth_info
    @History = new EmojidexUserHistory @EC
    @Favorites = new EmojidexUserFavorites @EC
    @Newest = new EmojidexUserNewest @EC
    @Popular = new EmojidexUserPopular @EC
    # @_auto_login()

  # Checks for local saved login data, and if present sets the username and api_key
  _auto_login: () ->
    return if @closed_net
    @auth_info = @EC.Data.auth_info()
    if @auth_info?.token? then @sync_user_data() else @logout()

  # login
  # takes a hash with one of the following combinations:
  # 1. {authtype: 'plain', username: 'username', password: '****'}
  # 2. {authtype: 'token', username: 'username', auth_token: '****'}
  # 3. {authtype: 'basic', user: 'username-or-email', password: '****'}
  # 4. {authtype: 'google', #TODO
  # * if no hash is given auto login is attempted
  login: (params) ->
    switch params.authtype
      when 'plain'
        @plain_auth params.username, params.password, params.callback
      when 'token'
        @token_auth params.username, params.auth_token, params.callback
      when 'basic'
        @basic_auth params.user, params.password, params.callback
      when 'google'
        @google_auth params.callback
      else
        @_auto_login()

  # logout:
  # 'logs out' by clearing user data
  logout: () ->
    @EC.Data.auth_info @EC.Data._def_auth_info

  _authenticateAPI: (options, callback) ->
    ajax_obj =
      url: @EC.api_url + 'users/authenticate'
      dataType: 'json'
      success: (response) =>
        @_set_auth_from_response(response).then =>
          callback? @auth_info
      error: (response) =>
        status = JSON.parse response.responseText
        @auth_info =
          status: status.auth_status
          token: null
          user: ''
        @EC.Data.auth_info(@EC.Data.auth_info).then =>
          callback? { auth_info: @auth_info, error_info: response }

    $.ajax $.extend ajax_obj, options

  # regular login with username/email and password
  plain_auth: (username, password, callback) ->
    @_authenticateAPI
      data:
        username: username
        password: password,
      callback

  token_auth: (username, token, callback) ->
    @_authenticateAPI
      data:
        username: username
        token: token,
      callback

  # auth with HTTP basic auth
  basic_auth: (user, password, callback) ->
    @_authenticateAPI
      data:
        user: user
        password: password,
      callback

  # auth with google oauth2
  google_auth: (callback) ->
    # TODO
    return false

  # directly set auth credentials
  set_auth: (user, token) ->
    @EC.Data.auth_info(
      status: 'verified'
      user: user
      token: token
    ).then (data) =>
      @auth_info = @EC.Data.storage.get 'emojidex.auth_info'
      @sync_user_data()
      return data

  # sets auth parameters from a successful auth request [login]
  _set_auth_from_response: (response) ->
    @EC.Data.auth_info(
      status: response.auth_status
      token: response.auth_token
      user: response.auth_user
    ).then (data)=>
      @auth_info = @EC.Data.storage.get 'emojidex.auth_info'
      @sync_user_data()
      return data

  sync_user_data: () ->
    @History.token = @Favorites.token = @Newest.token = @Popular.token = @auth_info.token
    @Favorites.sync()
    @History.sync()
