describe 'EmojidexData', ->
  beforeEach (done)->
    helperBefore done

  it 'has the Data class defined', ->
    expect(EC.Data).toBeDefined()
