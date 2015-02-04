class EmojidexUtil
  # Escapes spaces to underscore
  escape_term: (term) ->
    term.split(' ').join('_')

  # De-Escapes underscores to spaces
  de_escape_term: (term) ->
    term.split('_').join(' ')

  # Breakout into an array
  breakout: (items) ->
    return [] if items == null
    items = [items] unless items instanceof Array
    items

  # Converts an emoji array to [{code: "moji_code", img_url: "http://cdn...moji_code.png}] format
  simplify: (emoji = @results, size_code = @size_code) ->
    ({code: @escape_term(moji.code), img_url: "#{@cdn_url}/#{size_code}/#{@escape_term(moji.code)}.png"} \
      for moji in emoji)
