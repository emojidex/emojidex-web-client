/* eslint-disable no-undef */
describe('EmojidexIndexes', () => {
  beforeAll(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  it('index', async done => {
    const emojiData = await ECSpec.Indexes.index()
    expect(emojiData.length).toBeTruthy()
    await ECSpec.Indexes.next()
    expect(ECSpec.Indexes.curPage).toEqual(2)
    await ECSpec.Indexes.prev()
    expect(ECSpec.Indexes.curPage).toEqual(1)
    done()
  })

  it('static', async done => {
    const emojiData = await ECSpec.Indexes.static(['utf_emoji', 'extended_emoji'], 'en')
    expect(ECSpec.Emoji._emojiInstance).toEqual(jasmine.arrayContaining([emojiData[0], emojiData[emojiData.length - 1]]))
    done()
  })

  it('can not get newest index because user is not premium', async done => {
    const emojiData = await ECSpec.Indexes.newest()
    expect(emojiData.length).toEqual(0)
    done()
  })

  it('can not get popular index because user is not premium', async done => {
    const emojiData = await ECSpec.Indexes.popular()
    expect(emojiData.length).toEqual(0)
    done()
  })

  describe('[Premium user only]', () => {
    beforeEach(async done => {
      await setPremiumUser()
      done()
    })

    if (hasPremiumAccount()) {
      it('gets newest index', async done => {
        const emojiData = await ECSpec.Indexes.newest()
        expect(emojiData.length).toBeTruthy()
        await ECSpec.Indexes.next()
        expect(ECSpec.Indexes.curPage).toEqual(2)
        await ECSpec.Indexes.prev()
        expect(ECSpec.Indexes.curPage).toEqual(1)
        done()
      })

      it('gets popular index', async done => {
        const emojiData = await ECSpec.Indexes.popular()
        expect(emojiData.length).toBeTruthy()
        await ECSpec.Indexes.next()
        expect(ECSpec.Indexes.curPage).toEqual(2)
        await ECSpec.Indexes.prev()
        expect(ECSpec.Indexes.curPage).toEqual(1)
        done()
      })
    }
  })
})
/* eslint-enable no-undef */
