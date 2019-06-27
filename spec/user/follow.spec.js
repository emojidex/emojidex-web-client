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

  it('add following', done => {
    pending('Delete API is not working')
    ECSpec.User.Follow.addFollowing('test', following => {
      expect(following).toContain('test')
      done()
    })
  })

  it('delete following', done => {
    pending('503 error')
    ECSpec.User.Follow.deleteFollowing('test', following => {
      expect(following).not.toContain('test')
      done()
    })
  })

  describe('Followers  [require premium user]', () => {
    if (typeof premiumUserInfo === 'undefined' || premiumUserInfo === null) {
      pending()
    }

    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

    it('get followers', done => {
      ECSpec.User.Follow.getFollowers(followers => {
        expect(followers).toEqual(jasmine.any(Array))
        done()
      })
    })
  })
})
/* eslint-enable no-undef */
