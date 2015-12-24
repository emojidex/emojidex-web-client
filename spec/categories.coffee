describe 'EmojidexCategories', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore, getCosmosEmoji]
      end: done

  it 'getEmoji', (done) ->
    EC.Categories.getEmoji 'cosmos', (emojis) =>
      expect(emojis).toContain(jasmine.objectContaining cosmos_emoji[0])
      done()

  it 'sync', (done) ->
    EC.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()
