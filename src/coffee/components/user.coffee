class EmojidexUser
  constructor: (@EC) ->
    @auth_info = @EC.Data._def_auth_info
    @History = new EmojidexUserHistory @EC
    @Favorites = new EmojidexUserFavorites @EC
    @_auto_login()

  # Checks for local saved login data, and if present sets the username and api_key
  _auto_login: () ->
    return if @closed_net
    @auth_info = @EC.Data.auth_info()
    if @auth_info['token']? then @sync_user_data() else @logout()

  # login
  # takes a hash with one of the following combinations:
  # 1. { authtype: 'plain', username: 'username-or-email', password: '****'}
  # 1. { authtype: 'basic', user: 'username-or-email', pass: '****'}
  # 3. { authtype: 'google', #TODO
  # * if no hash is given auto login is attempted
  login: (params) ->
    switch params.authtype
      when 'plain'
        @plain_auth params.username, params.password, params.callback
      when 'basic'
        @basic_auth params.user, params.pass, params.callback
      when 'google'
        @google_auth params.callback
      else
        @_auto_login()

  # logout:
  # 'logs out' by clearing user data
  logout: () ->
    @EC.Data.auth_info @EC.Data._def_auth_info

  # regular login with username/email and password
  plain_auth: (username, password, callback = null) ->
    $.ajax
      url: @EC.api_url + 'users/authenticate'
      dataType: 'json'
      data:
        username: username
        password: password
      success: (response) =>
        @_set_auth_from_response response
        callback? @auth_info
      error: (response) =>
        status = JSON.parse response.responseText
        @auth_info = @EC.Data.auth_info
          status: status.auth_status
          token: null
          user: ''
        callback? { auth_info: @auth_info, error_info: response }

  # auth with HTTP basic auth
  basic_auth: (user, pass, callback = null) ->
    # TODO
    return false

  # auth with google oauth2
  google_auth: (callback = null) ->
    return false

  # directly set auth credentials
  set_auth: (user, token) ->
    @auth_info = @EC.Data.auth_info
      status: 'verified'
      token: token
      user: user
    @sync_user_data()

  # sets auth parameters from a successful auth request [login]
  _set_auth_from_response: (response) ->
    @auth_info = @EC.Data.auth_info
      status: response.auth_status
      token: response.auth_token
      user: response.auth_user
    @sync_user_data()

  sync_user_data: () ->
    @History.token = @Favorites.token = @auth_info['token']
    @Favorites.sync()
    @History.sync()
