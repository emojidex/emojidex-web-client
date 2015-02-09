describe 'EmojidexSearch', ->
  beforeEach helperBefore
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

  it 'advanced: term', (done) ->
    @EC.Search.advanced term: 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'advanced: categories', (done) ->
    @EC.Search.advanced term: 'kiss', categories: ["objects"], (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  # it 'advanced: tags', (done) ->
  #   @EC.Search.advanced '', ["Star Trek"], [], (emoji_data) ->
  #     console.dir emoji_data
  #     expect(emoji_data).toContain(
  #       jasmine.objectContaining emoji_kiss
  #     )
  #     done()
