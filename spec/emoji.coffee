describe 'EmojidexEmoji', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  it 'has the Emoji class defined', ->
    expect(EC.Emoji).toBeDefined()
