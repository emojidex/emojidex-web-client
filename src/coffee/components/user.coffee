class EmojidexUser
  constructor: (shared = null, opts) ->
    @S = shared || new EmojidexShared
    @auth_info = @S.Data._def_auth_info()
    @History = new EmojidexUserHistory(@S)
    @Favorites = new EmojidexUserFavorites(@S)
    @_auto_login()

  # Checks for local saved login data, and if present sets the username and api_key
  _auto_login: () ->
    return if @closed_net
    @auth_info = @S.Data.auth_info()
    if @auth_info['token'] != null
      @sync_user_data()
    else
      @logout()

  # login
  # takes a hash with one of the following combinations:
  # 1. { authtype: 'plain', username: 'username-or-email', password: '****'}
  # 1. { authtype: 'basic', user: 'username-or-email', pass: '****'}
  # 3. { authtype: 'google', #TODO
  # * if no hash is given auto login is attempted
  login: (params) ->
    switch params.authtype
      when 'plain'
        @plain_auth(params.username, params.password, params.callback)
      when 'basic'
        @basic_auth(params.user, params.pass, params.callback)
      when 'google'
        @google_auth(params.callback)
      else
        @_auto_login()

  # logout:
  # 'logs out' by clearing user data
  logout: () ->
    @S.Data.auth_info(@S.Data._def_auth_info())

  # regular login with username/email and password
  plain_auth: (username, password, callback = null) ->
    url = @S.api_url + 'users/authenticate?' + $.param(username: username, password: password)
    $.getJSON(url)
      .error (response) =>
        @auth_info = @S.Data.auth_info({
          status: response.auth_status,
          token: null,
          user: ''
        })
      .success (response) =>
        @_set_auth_from_response(response)
        callback(@auth_info) if callback

  # auth with HTTP basic auth
  basic_auth: (user, pass, callback = null) ->
    # TODO
    return false

  # auth with google oauth2
  google_auth: (callback = null) ->
    return false

  # sets auth parameters from a successful auth request [login]
  _set_auth_from_response: (response) ->
    @auth_info = @S.Data.auth_info({
      status: response.auth_status,
      token: response.auth_token,
      user: response.auth_user
    })
    @sync_user_data()

  sync_user_data: () ->
    @History.token = @Favorites.token = @auth_info['token']
    @Favorites.sync()
    @History.sync()