class EmojidexEmoji
  constructor: (shared = null) ->
    @S = shared || new EmojidexShared
    @_emoji = @S.Data.emoji()

    if @S.Data.emoji().length == 0
      @seed()

  # Gets the full list of caetgories available
  seed: (locale) ->
    locale = @S.locale unless locale != null
    switch locale
      when 'en'
        @S.Indexes.user('emoji', @combine)
        @S.Indexes.user('emojidex', @combine)
      when 'ja'
        @S.Indexes.user('絵文字', @combine)
        @S.Indexes.user('絵文字デックス', @combine)

  all: () ->
    @_emoji

  # internal collection search
  search: (term, callback = null) ->
    results = (moji for moji in @_emoji when moji.code.match(term))
    callback(results) if callback
    results

  # internal collection search (starting with)
  starting: (term, callback = null) ->
    results = (moji for moji in @_emoji when moji.code.match(term))
    callback(results) if callback
    results

  # Concatenates and flattens the given emoji array into the @emoji array
  combine: (emoji) =>
    @_emoji = @S.Data.emoji($.extend(@_emoji, emoji))

  # Clears the emoji array and emoji in storage.
  # DO NOT call this unless you have a really good reason!
  flush: () ->
    @_emoji = @S.Data.emoji([])
