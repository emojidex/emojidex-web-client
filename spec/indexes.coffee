describe 'EmojidexIndexes', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore, getExtendedEmojiData]
      end: done

  it 'user', (done) ->
    EC.Indexes.user 'emojidex', (emoji_data) =>
      expect(emoji_data).toContain(jasmine.objectContaining emoji_emojidex[0])
      done()

  it 'index', (done) ->
    EC.Indexes.index (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()
