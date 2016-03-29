class EmojidexData
  constructor: (@EC, @options) ->
    @_def_auth_info =
      status: 'none'
      user: ''
      token: null

    if @options?.storageHubPath?
      @storage = new EmojidexDataStorage @options.storageHubPath
    else
      @storage = new EmojidexDataStorage()

    return @storage.hub.onConnect().then( =>
      @storage.hub.getKeys()
    ).then((keys) =>
      if keys.indexOf('emojidex') isnt -1
        return @storage.update_cache 'emojidex'
      else
        @storage.hub_cache =
          emojidex:
            emoji: @EC.options?.emoji || []
            history: @EC.options?.history || []
            favorites: @EC.options?.favorites || []
            categories: @EC.options?.categories || []
            auth_info: @EC.options?.auth_info || @_def_auth_info
        return @storage.update 'emojidex', @storage.hub_cache.emojidex
    ).then((data) =>
      if @storage.hub_cache?.emojidex?.cdn_url?
        @EC.cdn_url = @storage.get 'emojidex.cdn_url'
      else
        # if the CDN URL has not been overridden
        # attempt to get it from the api env
        if @EC.cdn_url is @EC.defaults.cdn_url and @EC.closed_net is false
          $.ajax(
            url: @EC.api_url + "/env"
            dataType: 'json'
          ).then (response) =>
            @EC.env = response
            @EC.cdn_url = "https://#{@EC.env.s_cdn_addr}/emoji/"
            return @storage.update('emojidex', cdn_url: @EC.cdn_url)
    ).then (data) =>
      @EC.Data = @

  emoji: (emoji_set) ->
    if emoji_set?
      if @storage.hub_cache.emoji?
        hub_emoji = @storage.hub_cache.emoji
        for new_emoji in emoji_set
          for emoji in hub_emoji
            if new_emoji.code is emoji.code
              hub_emoji.splice hub_emoji.indexOf(emoji), 1, new_emoji
              break
            else if emoji is hub_emoji[hub_emoji.length - 1]
              hub_emoji.push new_emoji
        return @storage.update 'emojidex', emoji: hub_emoji
      else
        return @storage.update 'emojidex', emoji: emoji_set
    @storage.hub_cache.emoji

  favorites: (favorites_set) ->
    return @storage.update('emojidex', favorites: favorites_set) if favorites_set?
    @storage.hub_cache.favorites

  history: (history_set) ->
    return @storage.update('emojidex', history: history_set) if history_set?
    @storage.hub_cache.history

  categories: (categories_set) ->
    return @storage.update('emojidex', categories: categories_set) if categories_set?
    @storage.hub_cache.categories

  auth_info: (auth_info_set) ->
    if auth_info_set?
      @storage.update('emojidex', auth_info: auth_info_set)
