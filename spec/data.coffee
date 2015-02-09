describe 'EmojidexData', ->
  beforeEach helperBefore

  it 'Client have Data?', ->
    expect(@EC.Data).toBeDefined()
