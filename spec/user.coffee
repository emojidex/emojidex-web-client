describe 'EmojidexUser', ->
  beforeEach (done)->
    helperBefore done

  describe 'Favorites', ->
    it 'get', (done) ->
      EC.User.Favorites.get (favorites)->
        expect(favorites).toContain(
          jasmine.objectContaining(emoji_emojidex)
        )
        done()

    it 'all', ->
      expect(EC.User.Favorites.all()).toContain(
        jasmine.objectContaining(emoji_emojidex)
      )

    # it 'set_favorites', (done) ->
    #   EC.set_favorites 'emoji', (favorites)->
    #     expect(EC.favorites).toContain(
    #       jasmine.objectContaining(emoji)
    #     )
    #     done()

    # Not working on PhantomJS, browser is OK.
    # it 'unset_favorites', (done) ->
    #   EC.unset_favorites 'emoji', (favorites)->
    #     expect(EC.favorites).not.toContain(
    #       jasmine.objectContaining(emoji)
    #     )
    #     done()
