class EmojidexEmoji
  constructor: (shared = null, data = null, opts) ->
    @S = shared || new EmojidexShared
    @Data = data || new EmojidexData
    @_emoji = @Data.emoji()

    if @Data.emoji().length == 0
      @seed()

  # Gets the full list of caetgories available
  seed: (callback = null, locale) ->
    locale = @S.locale unless locale != null
    switch locale
      when 'en'
        @S.Index.user('emoji', @combine)
        @S.Index.user('emojidex', @combine)
      when 'ja'
        @S.Index.user('絵文字', @combine)
        @S.Index.user('絵文字デックス', @combine)

  all: () ->
    @_emoji

  # internal collection search
  search: (term, callback = null) ->
    results = (moji for moji in @_emoji when @_emoji.code.match('.*' + term + '.*/i'))
    callback(results) if callback
    results

  # Concatenates and flattens the given emoji array into the @emoji array
  combine: (emoji) ->
    @_emoji = $.extend @_emoji, emoji
    @Data.emoji(@_emoji)
