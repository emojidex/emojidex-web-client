describe('EmojidexUser', function() {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  describe('Login', function() {
    it('logs in by auth token', done =>
      EC_spec.User.login({
        authtype: 'token',
        username: test_user_info.auth_user,
        auth_token: test_user_info.auth_token,
        callback(auth_info) {
          expect(EC_spec.User.auth_info.status).toEqual('verified');
          done();
        }
      })
    );

    describe('[Require user info]', function() {
      if (typeof user_info === 'undefined' || user_info === null) { pending(); }
      it('logs in by plain authentication (username, password)', done =>
        EC_spec.User.login({
          authtype: 'plain', username: user_info.auth_user, password: user_info.password, callback(auth_info) {
            expect(auth_info.status).toEqual('verified');
            done();
          }
        })
      );

      it('logs in through a basic login scheme (email, password)', done =>
        EC_spec.User.login({
          authtype: 'basic', user: user_info.email, password: user_info.password, callback(auth_info) {
            expect(auth_info.status).toEqual('verified');
            done();
          }
        })
      );
    });
  });

  describe('User Details', function() {
    it('has r18, pro, premium, etc.', function(done) {
      expect(EC_spec.User.auth_info.r18).toEqual(true);
      expect(EC_spec.User.auth_info.pro).toEqual(false);
      expect(EC_spec.User.auth_info.premium).toEqual(false);
      done();
    });

    describe('[Require premium user info] User Details', function() {
      if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
      it('has r18, pro, premium, etc.', done =>
        EC_spec.User.login({
          authtype: 'token', username: premium_user_info.auth_user, auth_token: premium_user_info.auth_token, callback(auth_info) {
            expect(EC_spec.User.auth_info.premium).toEqual(true);
            done();
          }
        })
      );
    });
  });
});
