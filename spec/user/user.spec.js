/* eslint-disable no-undef */
describe('EmojidexUser', () => {
  beforeEach(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  describe('Login', () => {
    it('logs in by auth token', async done => {
      const authInfo = await ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token // eslint-disable-line camelcase
      })
      expect(authInfo.status).toEqual('verified')
      done()
    })

    describe('[Require user info]', () => {
      if (hasUserAccount()) {
        it('logs in by plain authentication (username, password)', async done => {
          const authInfo = await ECSpec.User.login({
            authtype: 'plain',
            username: userInfo.auth_user,
            password: userInfo.password
          })
          expect(authInfo.status).toEqual('verified')
          done()
        })

        it('logs in through a basic login scheme (email, password)', async done => {
          const authInfo = await ECSpec.User.login({
            authtype: 'basic',
            user: userInfo.email,
            password: userInfo.password
          })
          expect(authInfo.status).toEqual('verified')
          done()
        })
      }
    })

    it('logs in by session', async done => {
      await ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token // eslint-disable-line camelcase
      })
      const authInfo = await ECSpec.User.login({ authtype: 'session' })
      expect(authInfo.status).toEqual('verified')
      done()
    })

    it('logs in by auto', async done => {
      await ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token // eslint-disable-line camelcase
      })
      const authInfo = await ECSpec.User.login()
      expect(authInfo.status).toEqual('verified')
      done()
    })

    it('logs out', async done => {
      await ECSpec.User.login({
        authtype: 'token',
        username: testUserInfo.auth_user,
        auth_token: testUserInfo.auth_token // eslint-disable-line camelcase
      })
      await ECSpec.User.logout()
      const authInfo = await ECSpec.Data.authInfo()
      const favorites = await ECSpec.Data.favorites()
      const history = await ECSpec.Data.history()
      expect(authInfo.status).toEqual('none')
      expect(favorites.length).toEqual(0)
      expect(history.length).toEqual(0)
      done()
    })

    it('failure', async done => {
      const authInfo = await ECSpec.User.login({
        authtype: 'token',
        username: 'aaa',
        auth_token: 'aaa' // eslint-disable-line camelcase
      })
      expect(authInfo.status).toEqual('unverified')
      done()
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
      if (hasPremiumAccount()) {
        it('has r18, pro, premium, etc.', async done => {
          const authInfo = await ECSpec.User.login({
            authtype: 'token',
            username: premiumUserInfo.auth_user,
            auth_token: premiumUserInfo.auth_token // eslint-disable-line camelcase
          })
          expect(authInfo.premium).toEqual(true)
          done()
        })
      }
    })
  })
})
/* eslint-enable no-undef */
