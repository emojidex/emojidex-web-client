describe('EmojidexUser', function() {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  describe('Login', function() {
    it('token login', done =>
      EC_spec.User.login({
        authtype: 'token',
        username: test_user_info.auth_user,
        auth_token: test_user_info.auth_token,
        callback(auth_info) {
          expect(EC_spec.User.auth_info.status).toEqual('verified');
          return done();
        }
      })
    
    );

    return describe('[Require user info]', function() {
      if (typeof user_info === 'undefined' || user_info === null) { pending(); }
      it('plain login', done =>
        EC_spec.User.login({authtype: 'plain', username: user_info.auth_user, password: user_info.password, callback(auth_info) {
          expect(auth_info.status).toEqual('verified');
          return done();
        }
        })
      
      );

      return it('basic login', done =>
        EC_spec.User.login({authtype: 'basic', user: user_info.email, password: user_info.password, callback(auth_info) {
          expect(auth_info.status).toEqual('verified');
          return done();
        }
        })
      
      );
    }
    );
  }
  );

  describe('User Details', function() {
    it('has r18, pro, premium, etc.', function(done) {
      expect(EC_spec.User.auth_info.r18).toEqual(false);
      expect(EC_spec.User.auth_info.pro).toEqual(false);
      expect(EC_spec.User.auth_info.premium).toEqual(false);
      return done();
    }
    );

    return describe('[Require user info] User Details', function() {
      if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
      return it('has r18, pro, premium, etc.', done =>
        EC_spec.User.login({authtype: 'token', username: premium_user_info.auth_user, auth_token: premium_user_info.auth_token, callback(auth_info) {
          expect(EC_spec.User.auth_info.r18).toEqual(true);
          expect(EC_spec.User.auth_info.premium).toEqual(true);
          return done();
        }
        })
      
      );
    }
    );
  }
  );

  describe('Favorites', function() {
    it('get', done =>
      EC_spec.User.Favorites.get(function(favorites) {
        expect(favorites.emoji).toContain(
          jasmine.objectContaining(emoji_emoji)
        );
        return done();
      })
    
    );

    return it('all', done =>
      EC_spec.User.Favorites.all(function(favorites) {
        expect(favorites.emoji).toContain(
          jasmine.objectContaining(emoji_emoji)
        );
        return done();
      })
    
    );
  }
  );

    // it 'set_favorites', (done) ->
    //   EC_spec.set_favorites 'emoji', (favorites)->
    //     expect(EC_spec.favorites).toContain(
    //       jasmine.objectContaining(emoji)
    //     )
    //     done()
    //
    // Not working on PhantomJS, browser is OK.
    // it 'unset_favorites', (done) ->
    //   EC_spec.unset_favorites 'emoji', (favorites)->
    //     expect(EC_spec.favorites).not.toContain(
    //       jasmine.objectContaining(emoji)
    //     )
    //     done()

  return describe('History', function() {
    it('get', done =>
      EC_spec.User.History.get(function(history_info) {
        expect(history_info.history.length).toBeTruthy();
        return done();
      })
    
    );

    return it('all', done =>
      EC_spec.User.History.all(function(history_data) {
        expect(history_data.history.length).toBeTruthy();
        return done();
      })
    
    );
  }
  );
}
);