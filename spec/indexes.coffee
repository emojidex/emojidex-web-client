describe 'EmojidexIndexes', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBefore, getExtendedEmojiData]
      end: done

  it 'user', (done) ->
    EC.Indexes.user 'emojidex', (emoji_data) =>
      expect(emoji_data).toContain(emoji_emojidex[0])
      done()

  it 'index', (done) ->
    EC.Indexes.index (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

  it 'static', (done) ->
    EC.Indexes.static ['utf_emoji', 'extended_emoji'], 'en', (emoji_data) ->
      expect(EC.Emoji._emoji_instance).toEqual(jasmine.arrayContaining [emoji_data[0], emoji_data[emoji_data.length - 1]])
      done()

  it 'select', (done) ->
    EC.Indexes.select 'kiss', (emoji_data) ->
      expect(emoji_data.code).toEqual('kiss')
      done()

  it 'next', (done) ->
    EC.Indexes.indexed.callback = ->
      expect(EC.Indexes.cur_page).toEqual 2
      done()
    EC.Indexes.next()

  it 'prev', (done) ->
    EC.Indexes.indexed.callback = ->
      expect(EC.Indexes.cur_page).toEqual 1
      done()
    EC.Indexes.prev()
