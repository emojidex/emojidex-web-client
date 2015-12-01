class EmojidexUtil
  constructor: (@EC) ->

  # Escapes spaces to underscore
  escape_term: (term) ->
    term.replace(/\s/g, '_').replace(/(\(|\))/g, '\\$1')

  # De-Escapes underscores to spaces
  de_escape_term: (term) ->
    term.replace /_/g, ' '

  # Breakout into an array
  breakout: (items) ->
    if items?
      if items instanceof Array
        return items
      else
        return [items]
    else
      return []

  # Converts an emoji array to [{code: "moji_code", img_url: "http://cdn...moji_code.png}] format
  simplify: (emoji = @results, size_code = @EC.size_code) ->
    for moji in emoji
      code: @escape_term moji.code
      img_url: "#{@EC.cdn_url}/#{size_code}/#{@escape_term moji.code}.png"
