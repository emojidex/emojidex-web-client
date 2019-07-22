/* eslint-disable no-undef */
describe('EmojidexUserFollow', () => {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('get following', done => {
    ECSpec.User.Follow.getFollowing(following => {
      expect(following).toEqual(jasmine.any(Array))
      done()
    })
  })

  // TODO: Delete API is not working
  xit('add following', done => {
    ECSpec.User.Follow.addFollowing('test', following => {
      expect(following).toContain('test')
      done()
    })
  })

  // TODO: 503 error
  xit('delete following', done => {
    ECSpec.User.Follow.deleteFollowing('test', following => {
      expect(following).not.toContain('test')
      done()
    })
  })

  describe('Followers  [require premium user]', () => {
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

    if (hasPremiumAccount()) {
      it('get followers', done => {
        ECSpec.User.Follow.getFollowers(followers => {
          expect(followers).toEqual(jasmine.any(Array))
          done()
        })
      })
    }
  })
})
/* eslint-enable no-undef */
