describe 'EmojidexData', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  it 'has the Data class defined', ->
    expect(EC.Data).toBeDefined()
