describe 'EmojidexUtil', ->
  beforeEach (done) ->
    helperChains
      functions: [clearStorage, helperBefore]
      end: done

  it 'escape_term', ->
    expect(EC_spec.Util.escape_term 'emoji kiss').toBe 'emoji_kiss'

  it 'de_escape_term', ->
    expect(EC_spec.Util.de_escape_term 'emoji_kiss').toBe 'emoji kiss'

  it 'simplify', ->
    emoji = EC_spec.Util.simplify [emoji_kissing]
    expect(emoji[0].code).toBe 'kissing'
    expect(emoji[0].img_url).toBe "#{EC_spec.cdn_url}/#{EC_spec.size_code}/#{emoji[0].code}.png"
