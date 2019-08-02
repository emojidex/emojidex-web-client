/* eslint-disable no-undef */
describe('EmojidexUserFollow', () => {
  beforeEach(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  it('get following', async done => {
    const following = await ECSpec.User.Follow.getFollowing()
    expect(following).toEqual(jasmine.any(Array))
    done()
  })

  // TODO: Delete API is not working
  xit('add following', async done => {
    const following = await ECSpec.User.Follow.addFollowing('test')
    expect(following).toContain('test')
    done()
  })

  // TODO: 503 error
  xit('delete following', async done => {
    const following = await ECSpec.User.Follow.deleteFollowing('test')
    expect(following).not.toContain('test')
    done()
  })

  describe('Followers  [require premium user]', () => {
    beforeEach(async done => {
      await helperChains([clearStorage, helperBeforeForPremiumUser])
      done()
    })

    if (hasPremiumAccount()) {
      it('get followers', async done => {
        const followers = await ECSpec.User.Follow.getFollowers()
        expect(followers).toEqual(jasmine.any(Array))
        done()
      })
    }
  })
})
/* eslint-enable no-undef */
