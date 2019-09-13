/* eslint-disable no-undef */
describe('EmojidexUserFavorites', () => {
  beforeEach(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  it('get', async done => {
    const favorites = await ECSpec.User.Favorites.get()
    const favoritesHubCache = await ECSpec.Data.favorites()
    expect(favorites).toContain(jasmine.objectContaining(ninjaEmoji))
    expect(favoritesHubCache.length).toBeLessThanOrEqual(50)
    done()
  })

  // NOTE: 現在のemojidex.comのAPIで、setはできているけどunsetが機能してない
  xit('set', async done => {
    const response = await ECSpec.User.Favorites.set('emoji')
    const codes = response.favorites.map(emoji => emoji.code)
    expect(codes).toContain('emoji')
    done()
  })

  xit('unset', async done => {
    const response = await ECSpec.User.Favorites.unset('emoji')
    const codes = response.map(emoji => emoji.code)
    expect(codes).not.toContain('emoji')
    done()
  })

  it('all', async done => {
    await specTimer(2000) // Favorites.sync()が終わっていない時があるので
    const favorites = await ECSpec.User.Favorites.all()
    expect(favorites).toContain(jasmine.objectContaining(ninjaEmoji))
    done()
  })

  describe('Favorites pages [require premium user]', () => {
    beforeEach(async done => {
      await helperChains([clearStorage, helperBeforeForPremiumUser])
      done()
    })

    if (hasPremiumAccount()) {
      it('next/prev', async done => {
        await specTimer(2000) // Favorites.sync()が終わっていない時があるので
        await ECSpec.User.Favorites.next()
        expect(ECSpec.User.Favorites.curPage).toEqual(2)
        await ECSpec.User.Favorites.prev()
        expect(ECSpec.User.Favorites.curPage).toEqual(1)
        done()
      })
    }
  })
})
/* eslint-enable no-undef */
