describe 'EmojidexSearch', ->
  beforeEach for_beforeEach

  it 'search', (done) ->
    @EC.Search.search 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'starting', (done) ->
    @EC.Search.starting 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'ending', (done) ->
    @EC.Search.ending 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'tags', (done) ->
    @EC.Search.tags '', (emoji_data) ->
      expect(emoji_data).toBeTruthy()
      done()

  it 'advanced', (done) ->
    @EC.Search.advanced 'kiss', [], [], (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()
