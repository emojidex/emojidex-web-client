describe 'EmojidexClient', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  it 'has the EmojidexClient class defined', ->
    expect(EC_spec).toBeDefined()
