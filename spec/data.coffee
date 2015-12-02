describe 'EmojidexData', ->
  beforeEach (done) ->
    helperChains
      chains: [helperBefore]
      end: done

  it 'has the Data class defined', ->
    expect(EC.Data).toBeDefined()
