/* eslint-disable no-undef */
describe('EmojidexIndexes', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore, getExtendedEmojiData],
      end: done
    })
  )

  it('user', done =>
    ECSpec.Indexes.user('emojidex', emojiData => {
      expect(emojiData).toContain(emojiEmojidex[0])
      done()
    })
  )

  it('index', done =>
    ECSpec.Indexes.index(emojiData => {
      expect(emojiData.length).toBeTruthy()
      done()
    })
  )

  it('static', done =>
    ECSpec.Indexes.static(['utf_emoji', 'extended_emoji'], 'en', emojiData => {
      expect(ECSpec.Emoji._emojiInstance).toEqual(jasmine.arrayContaining([emojiData[0], emojiData[emojiData.length - 1]]))
      done()
    })
  )

  it('select', async done => {
    const emojiData = await ECSpec.Indexes.select('kiss')
    expect(emojiData.code).toEqual('kiss')
    done()
  })

  it('next', done => {
    ECSpec.Indexes.indexed.callback = function () {
      expect(ECSpec.Indexes.curPage).toEqual(2)
      done()
    }

    ECSpec.Indexes.next()
  })

  it('prev', done => {
    ECSpec.Indexes.indexed.callback = function () {
      expect(ECSpec.Indexes.curPage).toEqual(1)
      done()
    }

    ECSpec.Indexes.prev()
  })

  it('can not get newest index because user is not premium', done =>
    ECSpec.Indexes.newest(emojiData => {
      expect(emojiData.length).toEqual(0)
      done()
    })
  )

  it('can not get popular index because user is not premium', done =>
    ECSpec.Indexes.popular(emojiData => {
      expect(emojiData.length).toEqual(0)
      done()
    })
  )

  describe('[Premium user only]', () => {
    beforeEach(done => {
      helperChains({
        functions: [setPremiumUser],
        end: done
      })
    })

    if (hasPremiumAccount()) {
      it('gets newest index', done =>
        ECSpec.Indexes.newest(emojiData => {
          expect(emojiData.length).toBeTruthy()
          done()
        })
      )

      it('gets popular index', done =>
        ECSpec.Indexes.popular(emojiData => {
          expect(emojiData.length).toBeTruthy()
          done()
        })
      )
    }
  })
})
/* eslint-enable no-undef */
