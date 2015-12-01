describe 'EmojidexCategories', ->
  beforeEach (done)->
    helperBefore done

  it 'sync', (done) ->
    EC.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()
