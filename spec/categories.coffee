describe 'EmojidexCategories', ->
  beforeEach (done) ->
    helperChains
      chains: [helperBefore]
      end: done

  it 'sync', (done) ->
    EC.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()
