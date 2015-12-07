class EmojidexData
  constructor: (@EC) ->
    @_def_auth_info =
      status: 'none'
      user: ''
      token: null

    @emojidex_data = {}

    # for dist --------
    # @storage = new CrossStorageClient 'https://www.emojidex.com/hub'

    # for dev --------
    @storage = new CrossStorageClient 'http://localhost:8001/build/hub.html'

    @storage.onConnect().then(=>
      @storage.getKeys()
    ).then((keys)=>
      if keys.indexOf('emojidex') isnt -1
        @get_hub_emojidex()
      else
        @emojidex_data =
          emoji: @EC.options.emoji || []
          history: @EC.options.history || []
          favorites: @EC.options.favorites || []
          categories: @EC.options.categories || []
          auth_info: @EC.options.auth_info || @_def_auth_info
        @storage.set 'emojidex', @emojidex_data
    ).then(=>
      if @emojidex_data.cdn_url?
        @EC.cdn_url = @emojidex_data.cdn_url
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
              @EC.Data.update_hub_data
                cdn_url: @EC.cdn_url
    )

  update_hub_data: (data) ->
    $.extend @emojidex_data, data
    @storage.set 'emojidex', @emojidex_data

  get_hub_emojidex: ->
    @storage.get('emojidex').then((data) =>
      @emojidex_data = data
    )

  emoji: (emoji_set) ->
    if emoji_set?
      if @emojidex_data.emoji?
        @update_hub_data
          emoji: emoji_set
      else
        ls_emoji = @emojidex_data.emoji
        for new_emoji in emoji_set
          for emoji in ls_emoji
            if new_emoji.code is emoji.code
              ls_emoji.splice ls_emoji.indexOf(emoji), 1, new_emoji
              break
            else if emoji is ls_emoji[ls_emoji.length - 1]
              ls_emoji.push new_emoji
        @update_hub_data
          emoji: ls_emoji
    @emojidex_data.emoji

  favorites: (favorites_set) ->
    @update_hub_data(favorites: favorites_set) if favorites_set?
    @emojidex_data.favorites

  history: (history_set) ->
    @update_hub_data(history: history_set) if history_set?
    @emojidex_data.history

  categories: (categories_set) ->
    @update_hub_data(categories: categories_set) if categories_set?
    @emojidex_data.categories

  auth_info: (auth_info_set) ->
    @update_hub_data(auth_info: auth_info_set) if auth_info_set?
    @emojidex_data.auth_info
