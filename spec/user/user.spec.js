/* eslint-disable no-undef */
describe('EmojidexUser', () => {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  describe('Login', () => {
    it('logs in by auth token', done =>
      ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token, // eslint-disable-line camelcase
        callback(authInfo) {
          expect(authInfo.status).toEqual('verified')
          done()
        }
      })
    )

    describe('[Require user info]', () => {
      if (typeof userInfo !== 'undefined' && userInfo !== null) {
        it('logs in by plain authentication (username, password)', done =>
          ECSpec.User.login({
            authtype: 'plain', username: userInfo.auth_user, password: userInfo.password, callback(authInfo) {
              expect(authInfo.status).toEqual('verified')
              done()
            }
          })
        )

        it('logs in through a basic login scheme (email, password)', done =>
          ECSpec.User.login({
            authtype: 'basic', user: userInfo.email, password: userInfo.password, callback(authInfo) {
              expect(authInfo.status).toEqual('verified')
              done()
            }
          })
        )
      }
    })
    
    it('logs in by session', done => {
      ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token
      }).then(() => {
        return ECSpec.User.login({ authtype: 'session' })
      }).then(authInfo => {
        expect(authInfo.status).toEqual('verified')
        done()
      })
    })
    
    it('logs in by auto', done => {
      ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token
      }).then(() => {
        return ECSpec.User.login()
      }).then(() => {
        expect(ECSpec.User.authInfo.status).toEqual('verified')
        done()
      })
    })
    
    it('logs out', done => {
      ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token
      }).then(() => {
        return ECSpec.User.logout()
      }).then(() => {
        expect(ECSpec.User.authInfo.status).toEqual('none')
        done()
      })
    })
  })

  describe('User Details', () => {
    it('has r18, pro, premium, etc.', done => {
      expect(ECSpec.User.authInfo.r18).toEqual(true)
      expect(ECSpec.User.authInfo.pro).toEqual(false)
      expect(ECSpec.User.authInfo.premium).toEqual(false)
      done()
    })

    describe('[Require premium user info] User Details', () => {
      if (typeof premiumUserInfo !== 'undefined' && premiumUserInfo !== null) {
        it('has r18, pro, premium, etc.', done =>
          ECSpec.User.login({
            authtype: 'token',
            username: premiumUserInfo.auth_user,
            auth_token: premiumUserInfo.auth_token, // eslint-disable-line camelcase
            callback(authInfo) {
              expect(authInfo.premium).toEqual(true)
              done()
            }
          })
        )
      }
    })
  })
})
/* eslint-enable no-undef */
