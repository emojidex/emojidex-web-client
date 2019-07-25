/* eslint-disable no-undef */
describe('EmojidexUserFavorites', () => {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('get', async done => {
    const favorites = await ECSpec.User.Favorites.get()
    expect(favorites).toContain(jasmine.objectContaining(emojiEmoji))
    done()
  })
  
  // NOTE: 現在のemojidex.comのAPIで、setはできているけどunsetが機能してない
  // it('set', async done => {
  //   const response = await ECSpec.User.Favorites.set('emoji')
  //   const codes = response.favorites.map(emoji => { return emoji.code })
  //   expect(codes).toContain('emoji')
  //   done()
  // })
  // 
  // it('unset', async done => {
  //   const response = await ECSpec.User.Favorites.unset('emoji')
  //   const codes = response.map(emoji => { return emoji.code })
  //   expect(codes).not.toContain('emoji')
  //   done()
  // })

  it('all', async done => {
    await specTimer(2000) // Favorites.sync()が終わっていない時があるので
    const favorites = await ECSpec.User.Favorites.all()
    expect(favorites).toContain(jasmine.objectContaining(emojiEmoji))
    done()
  })

  describe('Favorites pages [require premium user]', () => {
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

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
