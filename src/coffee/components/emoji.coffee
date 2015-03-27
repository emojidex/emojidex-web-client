class EmojidexEmoji
  constructor: (@EC) ->
    if @checkUpdate()
      @_emoji = @EC.Data.storage.get 'emojidex.emoji'
    else
      @EC.Data.storage.set 'emojidex.seedUpdated', new Date().toString()
      @EC.Data.storage.remove 'emojidex.emoji'
      @seed @set_emoji_data

  checkUpdate: ->
    if @EC.Data.storage.isSet 'emojidex.seedUpdated'
      current = new Date
      updated = new Date @EC.Data.storage.get 'emojidex.seedUpdated'
      if current - updated <= 3600000 * 48
        return true
      else
        return false
    else
      return false

  # Gets the full list of caetgories available
  seed: (callback) ->
    @EC.Indexes.static 'utf_emoji', callback
    @EC.Indexes.static 'extended_emoji', callback

  all: ->
    @_emoji

  # internal collection search
  search: (term, callback) ->
    results = (moji for moji in @_emoji when moji.code.match term)
    callback? results
    results

  # internal collection search (starting with)
  starting: (term, callback) ->
    results = (moji for moji in @_emoji when moji.code.match '^' + term)
    callback? results
    results

  # internal collection search (starting with)
  ending: (term, callback) ->
    results = (moji for moji in @_emoji when moji.code.match term + '$')
    callback? results
    results

  # search for emoji with the given tags
  tags: (tags, opts) ->
    tags = @EC.Util.breakout tags
    selection = opts.selection || @_emoji
    collect = []
    for tag in tags
      collect.concat (moji for moji in selection when $.inArray(tag, moji.tags) >= 0)
    collect

  # gets emoji in any of the given categories
  categories: (categories, opts) ->
    categories = @EC.Util.breakout categories
    source = opts.selection || @_emoji
    collect = []
    for category in categories
      collect.concat (moji for moji in source when moji.category is category)
    collect

  # searches by term (regex OK), containing the tags given, in any of the given categories
  advanced: (searchs) ->
    @categories(
      searchs.categories
      selection: @tags(searchs.tags, selection: @search searchs.term)
    )

  # Concatenates and flattens the given emoji array into the @emoji array
  combine: (emoji) =>
    @_emoji = @EC.Data.emoji emoji

  # Clears the emoji array and emoji in storage.
  # DO NOT call this unless you have a really good reason!
  flush: ->
    @_emoji = @EC.Data.emoji []
