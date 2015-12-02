describe 'EmojidexEmoji', ->
  beforeEach (done) ->
    helperChains
      chains: [helperBefore]
      end: done

  it 'has the Emoji class defined', ->
    expect(EC.Emoji).toBeDefined()
