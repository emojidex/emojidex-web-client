describe 'EmojidexEmoji', ->
  beforeEach helperBefore

  it 'Client have Emoji?', ->
    expect(@EC.Emoji).toBeDefined()
