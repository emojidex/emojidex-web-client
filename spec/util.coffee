describe 'EmojidexUtil', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  it 'has the Util class defined and instantiated', ->
    expect(EC.Util).toBeDefined()
