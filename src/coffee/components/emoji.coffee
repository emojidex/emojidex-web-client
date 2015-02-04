class EmojidexEmoji
  constructor: (@EC) ->
    @_emoji = @EC.Data.emoji()
    @util = new EmojidexUtil

    if @EC.Data.emoji().length == 0
      @seed()

  # Gets the full list of caetgories available
  seed: (locale) ->
    locale = @EC.locale unless locale != null
    switch locale
      when 'en'
        @EC.Indexes.user('emoji', @combine)
        @EC.Indexes.user('emojidex', @combine)
      when 'ja'
        @EC.Indexes.user('絵文字', @combine)
        @EC.Indexes.user('絵文字デックス', @combine)

  all: () ->
    @_emoji

  # internal collection search
  search: (term, callback = null, opts = {}) ->
    results = (moji for moji in @_emoji when moji.code.match(term))
    callback(results) if callback
    results

  # internal collection search (starting with)
  starting: (term, callback = null, opts = {}) ->
    results = (moji for moji in @_emoji when moji.code.match('^' + term))
    callback(results) if callback
    results

  # internal collection search (starting with)
  ending: (term, callback = null, opts = {}) ->
    results = (moji for moji in @_emoji when moji.code.match(term + '$'))
    callback(results) if callback
    results

  # search for emoji with the given tags
  tags: (tags, callback = null, opts = {}) ->
    tags = @util.breakout(tags)
    selection = opts.selection || @_emoji
    for tag in tags
      collect = (moji for moji in selection when ($.inArray(tag, moji.tags) >= 0))
    collect

  # gets emoji in any of the given categories
  categories: (categories, callback = null, opts = {}) ->
    categories = @util.breakout(categories)
    source = opts.selection || @_emoji
    collect = []
    for category in categories
      $.extend(collect, (moji for moji in source when moji.category == category))
    collect

  # searches by term (regex OK), containing the tags given, in any of the given categories
  advanced: (term, tags = [], categories = [], callback = null, opts = {}) ->
    @categories(categories, null, {selection: @tags(tags, null, {selection: @search(term)})})

  # Concatenates and flattens the given emoji array into the @emoji array
  combine: (emoji) =>
    @_emoji = @EC.Data.emoji($.extend(@_emoji, emoji))

  # Clears the emoji array and emoji in storage.
  # DO NOT call this unless you have a really good reason!
  flush: () ->
    @_emoji = @EC.Data.emoji([])
