describe 'EmojidexCategories', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBefore, getFacesEmoji]
      end: done

  it 'getEmoji', (done) ->
    EC_spec.Categories.getEmoji 'faces', (emojis) ->
      expect(emojis).toContain(jasmine.objectContaining faces_emoji[0])
      done()

  it 'next', (done) ->
    EC_spec.Categories.called_data.callback = ->
      expect(EC_spec.Categories.cur_page).toEqual 2
      done()
    EC_spec.Categories.next()

  it 'prev', (done) ->
    EC_spec.Categories.called_data.callback = ->
      expect(EC_spec.Categories.cur_page).toEqual 1
      done()
    EC_spec.Categories.prev()

  it 'sync', (done) ->
    EC_spec.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()

  it 'all', ->
    expect(EC_spec.Categories.all().length).toBeTruthy()
