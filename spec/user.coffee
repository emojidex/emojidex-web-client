describe 'EmojidexUser', ->
  beforeEach (done) ->
    helperChains
      functions: [clearStorage, helperBefore]
      end: done

  describe 'Login', ->
    it 'token login', (done) ->
      EC_spec.User.login
        authtype: 'token'
        username: test_user_info.auth_user
        auth_token: test_user_info.auth_token
        callback: (auth_info) ->
          expect(EC_spec.User.auth_info.status).toEqual('verified')
          done()

    describe '[Require user info]', ->
      pending() unless user_info?
      it 'plain login', (done) ->
        EC_spec.User.login authtype: 'plain', username: user_info.auth_user, password: user_info.password, callback: (auth_info) ->
          expect(auth_info.status).toEqual('verified')
          done()

      it 'basic login', (done) ->
        EC_spec.User.login authtype: 'basic', user: user_info.email, password: user_info.password, callback: (auth_info) ->
          expect(auth_info.status).toEqual('verified')
          done()

  describe 'User Details', ->
    it 'has r18, pro, premium, etc.', (done) ->
      expect(EC_spec.User.auth_info.r18).toEqual(false)
      expect(EC_spec.User.auth_info.pro).toEqual(false)
      expect(EC_spec.User.auth_info.premium).toEqual(false)
      done()

    describe '[Require user info] User Details', ->
      pending() unless premium_user_info?
      it 'has r18, pro, premium, etc.', (done) ->
        EC_spec.User.login authtype: 'token', username: premium_user_info.auth_user, auth_token: premium_user_info.auth_token, callback: (auth_info) ->
          expect(EC_spec.User.auth_info.r18).toEqual(true)
          expect(EC_spec.User.auth_info.premium).toEqual(true)
          done()

  describe 'Favorites', ->
    it 'get', (done) ->
      EC_spec.User.Favorites.get (favorites) ->
        expect(favorites.emoji).toContain(
          jasmine.objectContaining(emoji_emoji)
        )
        done()

    it 'all', (done) ->
      EC_spec.User.Favorites.all (favorites) ->
        expect(favorites.emoji).toContain(
          jasmine.objectContaining(emoji_emoji)
        )
        done()

    # it 'set_favorites', (done) ->
    #   EC_spec.set_favorites 'emoji', (favorites)->
    #     expect(EC_spec.favorites).toContain(
    #       jasmine.objectContaining(emoji)
    #     )
    #     done()
    #
    # Not working on PhantomJS, browser is OK.
    # it 'unset_favorites', (done) ->
    #   EC_spec.unset_favorites 'emoji', (favorites)->
    #     expect(EC_spec.favorites).not.toContain(
    #       jasmine.objectContaining(emoji)
    #     )
    #     done()

  describe 'History', ->
    it 'get', (done) ->
      EC_spec.User.History.get (history_info) ->
        expect(history_info.history.length).toBeTruthy()
        done()

    it 'all', (done) ->
      EC_spec.User.History.all (history_data) ->
        expect(history_data.history.length).toBeTruthy()
        done()

  describe '[Premium user only]', ->
    pending() unless premium_user_info?
    beforeEach (done) =>
      helperChains
        functions: [setPremiumUser]
        end: done

    describe 'Newest Emoji', ->
      it 'get', (done) ->
        EC_spec.User.Newest.get (newest_info) ->
          expect(newest_info?.emoji?.length).toBeTruthy()
          done()

    describe 'Popular Emoji', ->
      it 'get', (done) ->
        EC_spec.User.Popular.get (popular_info) ->
          expect(popular_info?.emoji?.length).toBeTruthy()
          done()
