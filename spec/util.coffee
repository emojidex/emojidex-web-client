describe 'EmojidexUtil', ->
  beforeEach (done) ->
    helperChains
      chains: [helperBefore]
      end: done

  it 'has the Util class defined and instantiated', ->
    expect(EC.Util).toBeDefined()
