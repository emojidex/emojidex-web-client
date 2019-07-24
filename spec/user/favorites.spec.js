/* eslint-disable no-undef */
describe('EmojidexUserFavorites', () => {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('get', done =>
    ECSpec.User.Favorites.get(favorites => {
      expect(favorites).toContain(
        jasmine.objectContaining(emojiEmoji)
      )
      done()
    })
  )
  
  // NOTE: 現在のemojidex.comのAPIで、setはできているけどunsetが機能してない
  // it('set', done => {
  //   ECSpec.User.Favorites.set('emoji').then(response => {
  //     const codes = response.favorites.map(emoji => { return emoji.code })
  //     expect(codes).toContain('emoji')
  //     done()
  //   })
  // })
  // 
  // it('unset', done => {
  //   ECSpec.User.Favorites.unset('emoji').then(response => {
  //     const codes = response.map(emoji => { return emoji.code })
  //     expect(codes).not.toContain('emoji')
  //     done()
  //   })
  // })

  it('all', done => {
    setTimeout(() => { // Favorites.sync()が終わっていない時があるので
      ECSpec.User.Favorites.all(favorites => {
        expect(favorites).toContain(
          jasmine.objectContaining(emojiEmoji)
        )
        done()
      })
    }, 2000)
  })

  describe('Favorites pages [require premium user]', () => {
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

    if (hasPremiumAccount()) {
      it('next/prev', done => {
        setTimeout(() => { // Favorites.sync()が終わっていない時があるので
          ECSpec.User.Favorites.next(() => {
            expect(ECSpec.User.Favorites.curPage).toEqual(2)
            ECSpec.User.Favorites.prev(() => {
              expect(ECSpec.User.Favorites.curPage).toEqual(1)
              done()
            })
          })
        }, 2000)
      })
    }
  })

  // it 'set_favorites', (done) ->
  //   ECSpec.set_favorites 'emoji', (favorites)->
  //     expect(ECSpec.favorites).toContain(
  //       jasmine.objectContaining(emoji)
  //     )
  //     done()
  //
  // Not working on PhantomJS, browser is OK.
  // it 'unset_favorites', (done) ->
  //   ECSpec.unset_favorites 'emoji', (favorites)->
  //     expect(ECSpec.favorites).not.toContain(
  //       jasmine.objectContaining(emoji)
  //     )
  //     done()
})
/* eslint-enable no-undef */
