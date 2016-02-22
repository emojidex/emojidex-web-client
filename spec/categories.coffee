describe 'EmojidexCategories', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBefore, getFacesEmoji]
      end: done

  it 'getEmoji', (done) ->
    EC.Categories.getEmoji 'faces', (emojis) ->
      expect(emojis).toContain(jasmine.objectContaining faces_emoji[0])
      done()

  it 'next', (done) ->
    EC.Categories.called_data.callback = ->
      expect(EC.Categories.cur_page).toEqual 2
      done()
    EC.Categories.next()

  it 'prev', (done) ->
    EC.Categories.called_data.callback = ->
      expect(EC.Categories.cur_page).toEqual 1
      done()
    EC.Categories.prev()

  it 'sync', (done) ->
    EC.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()

  it 'all', ->
    expect(EC.Categories.all().length).toBeTruthy()
