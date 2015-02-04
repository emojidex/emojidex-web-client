class EmojidexData
  constructor: (@EC) ->
    @storage = $.localStorage
    @storage.set "emojidex", {} unless @storage.isSet "emojidex"
    @storage.set "emojidex.emoji", @EC.options.emoji || [] unless @storage.isSet "emojidex.emoji"
    @storage.set "emojidex.history", @EC.options.history || [] unless @storage.isSet "emojidex.history"
    @storage.set "emojidex.favorites", @EC.options.favorites || [] unless @storage.isSet "emojidex.favorites"
    @storage.set "emojidex.categories", @EC.options.categories || [] unless @storage.isSet "emojidex.auth_info"
    @storage.set "emojidex.auth_info", @EC.options.auth_info || @_def_auth_info() unless @storage.isSet "emojidex.auth_info"

  emoji: (emoji_set) ->
    @storage.set "emojidex.emoji", emoji_set if emoji_set?
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

  _def_auth_info: () ->
    status: 'none'
    user: ''
    token: null

  auth_info: (auth_info_set) ->
    @storage.set "emojidex.auth_info", auth_info_set if auth_info_set?
    @storage.get "emojidex.auth_info"
