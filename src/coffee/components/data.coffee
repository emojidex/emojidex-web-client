class EmojidexData
  constructor: (@EC) ->
    @_def_auth_info =
      status: 'none'
      user: ''
      token: null

    @storage = $.localStorage
    @storage.set "emojidex", {} unless @storage.isSet "emojidex"
    @storage.set "emojidex.emoji", @EC.options.emoji || [] unless @storage.isSet "emojidex.emoji"
    @storage.set "emojidex.history", @EC.options.history || [] unless @storage.isSet "emojidex.history"
    @storage.set "emojidex.favorites", @EC.options.favorites || [] unless @storage.isSet "emojidex.favorites"
    @storage.set "emojidex.categories", @EC.options.categories || [] unless @storage.isSet "emojidex.auth_info"
    @storage.set "emojidex.auth_info", @EC.options.auth_info || @_def_auth_info unless @storage.isSet "emojidex.auth_info"

    if @storage.get 'emojidex.cdn_url'
      @EC.cdn_url = @storage.get 'emojidex.cdn_url'
    else
      # if the CDN URL has not been overridden
      # attempt to get it from the api env
      if @EC.cdn_url is @EC.defaults.cdn_url and @EC.closed_net is false
        $.ajax
          url: @EC.api_url + "/env"
          dataType: 'json'
          success: (response) =>
            @EC.env = response
            @EC.cdn_url = "https://#{@EC.env.s_cdn_addr}/emoji/"
            @EC.Data.storage.set 'emojidex.cdn_url', @EC.cdn_url

  emoji: (emoji_set) ->
    if @storage.isEmpty 'emojidex.emoji'
      @storage.set 'emojidex.emoji', emoji_set
    else
      ls_emoji = @storage.get 'emojidex.emoji'
      for new_emoji in emoji_set
        for emoji in ls_emoji
          if new_emoji.code is emoji.code
            ls_emoji.splice ls_emoji.indexOf(emoji), 1, new_emoji
            break
          else if emoji is ls_emoji[ls_emoji.length - 1]
            ls_emoji.push new_emoji
      @storage.set 'emojidex.emoji', ls_emoji

    @storage.get "emojidex.emoji"

  favorites: (favorites_set) ->
    @storage.set "emojidex.favorites", favorites_set if favorites_set?
    @storage.get "emojidex.favorites"

  history: (history_set) ->
    @storage.set "emojidex.history", history_set if history_set?
    @storage.get "emojidex.history"

  categories: (categories_set) ->
    @storage.set "emojidex.categories", categories_set if categories_set?
    @storage.get "emojidex.categories"

  auth_info: (auth_info_set) ->
    @storage.set "emojidex.auth_info", auth_info_set if auth_info_set?
    @storage.get "emojidex.auth_info"
