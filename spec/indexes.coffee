describe 'EmojidexIndexes', ->
  beforeEach (done)->
    helperBefore done

  it 'user', (done) ->
    EC.Indexes.user 'emojidex', (emoji_data) =>
      expect(emoji_data).toContain(jasmine.objectContaining emoji_emojidex[0])
      done()

  it 'index', (done) ->
    EC.Indexes.index (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

  it 'newest', (done) ->
    EC.Indexes.newest (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

  it 'popular', (done) ->
    EC.Indexes.popular (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()
