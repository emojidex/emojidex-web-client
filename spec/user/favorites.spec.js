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
    if (typeof premiumUserInfo === 'undefined' || premiumUserInfo === null) {
      pending()
    }

    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

    it('next/prev', done => {
      ECSpec.limit = 5
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
