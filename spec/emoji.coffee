describe 'EmojidexEmoji', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  describe 'check update', ->
    it 'need update', ->
      EC.Data.storage.set 'emojidex.seedUpdated', new Date('1/1/2016').toString()
      expect(EC.Emoji.checkUpdate()).toBe(false)
    it 'unnecessary update', ->
      EC.Data.storage.set 'emojidex.seedUpdated', new Date().toString()
      expect(EC.Emoji.checkUpdate()).toBe(true)

  it 'seed', (done) ->
    EC.Emoji.seed (emoji_data) ->
      expect(EC.Emoji._emoji_instance).toEqual(jasmine.arrayContaining [emoji_data[0], emoji_data[emoji_data.length - 1]])
      done()

  it 'all', (done) ->
    expect(EC.Emoji.all().length).toBeTruthy()
    done()

  it 'search', (done) ->
    EC.Emoji.search 'kissing', (emoji_data) ->
      expect(emoji_data).toContain(jasmine.objectContaining emoji_kissing)
      done()

  it 'starting', (done) ->
    EC.Emoji.search 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(jasmine.objectContaining emoji_kiss)
      done()

  it 'ending', (done) ->
    EC.Emoji.search 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(jasmine.objectContaining emoji_kiss)
      done()

  it 'tags', ->
    expect(EC.Emoji.tags '', '').toBeTruthy()

  it 'categories', ->
    expect(EC.Emoji.categories ['cosmos']).toBeTruthy()

  # it 'advenced', (done) ->
  #   done()
  #
  # it 'combine', (done) ->
  #   done()
  #
  # it 'flush', (done) ->
  #   done()
