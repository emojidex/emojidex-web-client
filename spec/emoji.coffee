describe 'EmojidexEmoji', ->
  beforeEach (done)->
    helperBefore done

  it 'has the Emoji class defined', ->
    expect(EC.Emoji).toBeDefined()
