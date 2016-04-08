describe 'EmojidexIndexes', ->
  beforeAll (done) ->
    helperChains
      functions: [clearStorage, helperBefore, getExtendedEmojiData]
      end: done

  it 'user', (done) ->
    EC_spec.Indexes.user 'emojidex', (emoji_data) =>
      expect(emoji_data).toContain(emoji_emojidex[0])
      done()

  it 'index', (done) ->
    EC_spec.Indexes.index (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

  it 'static', (done) ->
    EC_spec.Indexes.static ['utf_emoji', 'extended_emoji'], 'en', (emoji_data) ->
      expect(EC_spec.Emoji._emoji_instance).toEqual(jasmine.arrayContaining [emoji_data[0], emoji_data[emoji_data.length - 1]])
      done()

  it 'select', (done) ->
    EC_spec.Indexes.select 'kiss', (emoji_data) ->
      expect(emoji_data.code).toEqual('kiss')
      done()

  it 'next', (done) ->
    EC_spec.Indexes.indexed.callback = ->
      expect(EC_spec.Indexes.cur_page).toEqual 2
      done()
    EC_spec.Indexes.next()

  it 'prev', (done) ->
    EC_spec.Indexes.indexed.callback = ->
      expect(EC_spec.Indexes.cur_page).toEqual 1
      done()
    EC_spec.Indexes.prev()
