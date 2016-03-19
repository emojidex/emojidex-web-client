class EmojidexData
  constructor: (@EC) ->
    @_def_auth_info =
      status: 'none'
      user: ''
      token: null

    @hub_data = {}

    # for dist --------
    # @storage = new EmojidexDataStorage @

    # for dev --------
    @storage = new EmojidexDataStorage @, 'http://localhost:8001/build/hub.html'

    @storage.hub.onConnect().then(=>
      @storage.hub.getKeys()
    ).then((keys)=>
      if keys.indexOf('emojidex') isnt -1
        @storage.update_cache 'emojidex'
      else
        @hub_data =
          emojidex:
            emoji: @EC.options?.emoji || []
            history: @EC.options?.history || []
            favorites: @EC.options?.favorites || []
            categories: @EC.options?.categories || []
            auth_info: @EC.options?.auth_info || @_def_auth_info
        @storage.update 'emojidex', @hub_data.emojidex
    ).then =>
      if @hub_data?.emojidex?.cdn_url?
        @EC.cdn_url = @hub_data.emojidex.cdn_url
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
              @storage.update 'emojidex', cdn_url: @EC.cdn_url

  emoji: (emoji_set) ->
    if emoji_set?
      if @hub_data.emoji?
        hub_emoji = @hub_data.emoji
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
    @hub_data.emoji

  favorites: (favorites_set) ->
    @storage.update('emojidex', favorites: favorites_set) if favorites_set?
    @hub_data.favorites

  history: (history_set) ->
    @storage.update('emojidex', history: history_set) if history_set?
    @hub_data.history

  categories: (categories_set) ->
    @storage.update('emojidex', categories: categories_set) if categories_set?
    @hub_data.categories

  auth_info: (auth_info_set) ->
    if auth_info_set?
      promise = @storage.update('emojidex', auth_info: auth_info_set)

      if auth_info_set.get_auth_info
        return @hub_data.auth_info
      else
        return promise
