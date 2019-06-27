/* eslint-disable no-undef */
describe('EmojidexEmoji', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  describe('check update', () => {
    it('need update', done => {
      setTimeout(() => { // userDataSyncが終わっていないことがあるため
        ECSpec.Data.storage.update('emojidex.seedUpdated', new Date('1/1/2016').toString()).then(() => {
          expect(ECSpec.Emoji.checkUpdate()).toBe(true)
          done()
        })
      }, 1000)
    })

    it('unnecessary update', done =>
      ECSpec.Data.storage.update('emojidex.seedUpdated', new Date().toString()).then(() => {
        expect(ECSpec.Emoji.checkUpdate()).toBe(false)
        done()
      })
    )
  })

  it('seed', done =>
    ECSpec.Emoji.seed(emojiData => {
      expect(ECSpec.Emoji._emojiInstance).toEqual(jasmine.arrayContaining([emojiData[0], emojiData[emojiData.length - 1]]))
      done()
    })
  )

  it('all', done => {
    expect(ECSpec.Emoji.all().length).toBeTruthy()
    done()
  })

  it('search', done =>
    ECSpec.Emoji.search('kissing', emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining({ code: 'kissing', moji: '😗', unicode: '1f617', category: 'faces' }))
      done()
    })
  )

  it('starting', done =>
    ECSpec.Emoji.starting('kiss', emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
      done()
    })
  )

  it('ending', done =>
    ECSpec.Emoji.ending('kiss', emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
      done()
    })
  )

  it('tags', () => expect(ECSpec.Emoji.tags('weapon').length).toBeTruthy())

  it('categories', () => expect(ECSpec.Emoji.categories('cosmos').length).toBeTruthy())

  it('advenced', () => {
    const searchs = { categories: 'tools', tags: 'weapon', term: 'rifle' }
    expect(ECSpec.Emoji.advanced(searchs).length).toBeTruthy()
  })

  it('flush', done =>
    ECSpec.Emoji.flush().then(() => {
      expect(ECSpec.Emoji.all().length).toBe(0)
      done()
    })
  )
})
/* eslint-enable no-undef */
