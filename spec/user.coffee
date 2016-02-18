describe 'EmojidexUser', ->
  beforeEach (done) ->
    helperChains
      functions: [helperBefore]
      end: done

  describe 'Login', ->
    it 'token login', (done) ->
      EC.User.login authtype: 'token', username: user_info.auth_user, auth_token: user_info.auth_token, callback: () ->
        expect(EC.User.auth_info.status).toEqual('verified')
        done()

    describe '[Require user info]', ->
      pending() unless user_info.password?
      it 'plain login', (done) ->
        EC.User.login authtype: 'plain', username: user_info.auth_user, password: user_info.password, callback: () ->
          expect(EC.User.auth_info.status).toEqual('verified')
          done()

      it 'basic login', (done) ->
        EC.User.login authtype: 'basic', user: user_info.email, password: user_info.password, callback: () ->
          expect(EC.User.auth_info.status).toEqual('verified')
          done()

      # it 'google login', ->
      #   TODO:

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

  describe '[Premium user only]', ->
    pending() unless premium_user_info?
    describe 'Newest Emoji', ->
      it 'get', (done) ->
        setPremiumUser()
        EC.User.Newest.get (newest_info) ->
          expect(newest_info.emoji.length).toBeTruthy()
          done()

    describe 'Popular Emoji', ->
      it 'get', (done) ->
        setPremiumUser()
        EC.User.Popular.get (popular_info) ->
          expect(popular_info.emoji.length).toBeTruthy()
          done()
