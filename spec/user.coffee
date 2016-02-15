describe 'EmojidexUser', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  describe 'Favorites', ->
    it 'get', (done) ->
      EC.User.Favorites.get (favorites) ->
        expect(favorites.emoji).toContain(
          jasmine.objectContaining(emoji_emoji)
        )
        done()

    it 'all', ->
      expect(EC.User.Favorites.all().emoji).toContain(
        jasmine.objectContaining(emoji_emoji)
      )

    # it 'set_favorites', (done) ->
    #   EC.set_favorites 'emoji', (favorites)->
    #     expect(EC.favorites).toContain(
    #       jasmine.objectContaining(emoji)
    #     )
    #     done()
    #
    # Not working on PhantomJS, browser is OK.
    # it 'unset_favorites', (done) ->
    #   EC.unset_favorites 'emoji', (favorites)->
    #     expect(EC.favorites).not.toContain(
    #       jasmine.objectContaining(emoji)
    #     )
    #     done()

  describe 'History', ->
    it 'get', (done) ->
      EC.User.History.get (history_info) ->
        expect(history_info.history.length).toBeTruthy()
        done()

    it 'all', ->
      expect(EC.User.History.all().history.length).toBeTruthy()

  describe '[Premium User Only] Newest Emoji', ->
    it 'get', (done) ->
      setPremiumUser()
      EC.User.Newest.get (newest_info) ->
        expect(newest_info.emoji.length).toBeTruthy()
        done()

  describe '[Premium User Only] Popular Emoji', ->
    it 'get', (done) ->
      setPremiumUser()
      EC.User.Popular.get (popular_info) ->
        expect(popular_info.emoji.length).toBeTruthy()
        done()
