describe 'EmojidexUtil', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  it 'escape_term', ->
    expect(EC.Util.escape_term 'emoji kiss').toBe 'emoji_kiss'

  it 'de_escape_term', ->
    expect(EC.Util.de_escape_term 'emoji_kiss').toBe 'emoji kiss'

  it 'simplify', ->
    emoji = EC.Util.simplify [emoji_kissing]
    expect(emoji[0].code).toBe 'kissing'
    expect(emoji[0].img_url).toBe "#{EC.cdn_url}/#{EC.size_code}/#{emoji[0].code}.png"
