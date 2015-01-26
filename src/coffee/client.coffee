# emojidex coffee client
# * Provides search, index caching and combining and asset URI resolution
#
# =LICENSE=
# Licensed under the emojidex Open License
# https://www.emojidex.com/emojidex/emojidex_open_license
#
# Copyright 2013 Genshin Souzou Kabushiki Kaisha

class @EmojidexClient
  constructor: (opts = {}) ->
    @Util = new EmojidexUtil
    @S = new EmojidexShared(opts)
    @Data = @S.Data
    @Emoji = @S.Emoji
    @Categories = @S.Categories
    @Search = new EmojidexSearch(@S)
    #@_auto_login()

#    # init storage and state instances
#    @results = opts.results || []
#    @cur_page = opts.page || 1
#    @cur_limit = @limit
#    @count = opts.count || 0
#
#
#
#
#  # Checks for local saved login data, and if present sets the username and api_key
#  _auto_login: () ->
#    return if @closed_net
#    if @storage.get("emojidex.auth_token")?
#      @auth_status = @storage.get("emojidex.auth_status")
#      @auth_token = @storage.get("emojidex.auth_token")
#      @user = @storage.get("emojidex.user")
#      @get_user_data()
#    else
#      @logout()
#
#

#
#
#  # login
#  # takes a hash with one of the following combinations:
#  # 1. { authtype: 'plain', username: 'username-or-email', password: '****'}
#  # 1. { authtype: 'basic', user: 'username-or-email', pass: '****'}
#  # 3. { authtype: 'google', #TODO
#  # * if no hash is given auto login is attempted
#  login: (params) ->
#    switch params.authtype
#      when 'plain'
#        @plain_auth(params.username, params.password, params.callback)
#      when 'basic'
#        @basic_auth(params.user, params.pass, params.callback)
#      when 'google'
#        @google_auth(params.callback)
#      else
#        @_auto_login()
#
#  # logout:
#  # 'logs out' by clearing user data
#  logout: () ->
#    @auth_status = 'none'
#    @storage.set("emojidex.auth_status", @auth_status)
#    @user = ''
#    @storage.set("emojidex.user", @user)
#    @auth_token = null
#    @storage.set("emojidex.auth_token", @auth_token)
#
#  # regular login with username/email and password
#  plain_auth: (username, password, callback = null) ->
#    url = @api_url + 'users/authenticate?' + $.param(username: username, password: password)
#    $.getJSON(url)
#      .error (response) =>
#        @auth_status = response.auth_status
#        @auth_token = null
#        @user = ''
#      .success (response) =>
#        @_set_auth_from_response(response)
#        callback(response.auth_token) if callback
#
#  # auth with HTTP basic auth
#  basic_auth: (user, pass, callback = null) ->
#    # TODO
#    return false
#
#  # auth with google oauth2
#  google_auth: (callback = null) ->
#    return false
#
#  # sets auth parameters from a successful auth request [login]
#  _set_auth_from_response: (response) ->
#    @auth_status = response.auth_status
#    @storage.set("emojidex.auth_status", @auth_status)
#    @auth_token = response.auth_token
#    @storage.set("emojidex.auth_token", @auth_token)
#    @user = response.auth_user
#    @storage.set("emojidex.user", @user)
#    @get_user_data()
#
#  get_user_data: () ->
#    @get_favorites()
#    @get_history()
#
#  get_history: (opts) ->
#    if @auth_token?
#      $.getJSON((@api_url +  'users/history?' + $.param({auth_token: @auth_token})))
#        .error (response) =>
#          @history = []
#        .success (response) =>
#          @history = response
#
#  set_history: (emoji_code) ->
#    if @auth_token?
#      $.post(@api_url + 'users/history?' + \
#        $.param({auth_token: @auth_token, emoji_code: emoji_code}))
#
#  get_favorites: () ->
#    if @auth_token?
#      $.ajax
#        url: @api_url + 'users/favorites'
#        data:
#          auth_token: @auth_token
#
#        success: (response) ->
#          @favorites = response
#
#        error: (response) ->
#          @favorites = []
#
#  set_favorites: (emoji_code) ->
#    if @auth_token?
#      $.ajax
#        type: 'POST'
#        url: @api_url + 'users/favorites'
#        data:
#          auth_token: @auth_token
#          emoji_code: emoji_code
#
#        success: (response) ->
#          # @get_favorites() # re-obtain favorites
#
#  unset_favorites: (emoji_code) ->
#    if @auth_token?
#      $.ajax
#        type: 'DELETE'
#        url: @api_url + 'users/favorites'
#        data:
#          auth_token: @auth_token
#          emoji_code: emoji_code
#
#        success: (response) ->
#          # @get_favorites()
#
