class EmojidexUtil
  # Escapes spaces to underscore
  escape_term: (term) ->
    term.replace /\s/g, '_'

  # De-Escapes underscores to spaces
  de_escape_term: (term) ->
    term.replace /_/g, ' '

  # Breakout into an array
  breakout: (items) ->
    return [] unless items?
    items = [items] unless items instanceof Array

  # Converts an emoji array to [{code: "moji_code", img_url: "http://cdn...moji_code.png}] format
  simplify: (emoji = @results, size_code = @size_code) ->
    for moji in emoji
      code: @escape_term moji.code
      img_url: "#{@cdn_url}/#{size_code}/#{@escape_term moji.code}.png"
