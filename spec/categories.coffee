describe 'EmojidexCategories', ->
  beforeEach helperBefore

  it 'sync', (done) ->
    @EC.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()
