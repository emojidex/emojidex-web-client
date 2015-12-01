describe 'EmojidexUtil', ->
  beforeEach (done)->
    helperBefore done

  it 'has the Util class defined and instantiated', ->
    expect(EC.Util).toBeDefined()
