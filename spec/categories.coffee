describe 'EmojidexCategories', ->
  beforeEach for_beforeEach

  it 'sync', (done) ->
    @EC.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()
