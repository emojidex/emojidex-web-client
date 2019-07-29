/* eslint-disable no-undef */
describe('EmojidexEmoji', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  describe('check update', () => {
    it('need update', async done => {
      await specTimer(1000) // userDataSyncが終わっていないことがあるため
      await ECSpec.Data.storage.update('emojidex.seedUpdated', new Date('1/1/2016').toString())
      expect(ECSpec.Emoji.checkUpdate()).toBe(true)
      done()
    })

    it('unnecessary update', async done => {
      await ECSpec.Data.storage.update('emojidex.seedUpdated', new Date().toString())
      expect(ECSpec.Emoji.checkUpdate()).toBe(false)
      done()
    })
  })

  it('seed', async done => {
    const emojiData = await ECSpec.Emoji.seed()
    expect(ECSpec.Emoji._emojiInstance).toEqual(jasmine.arrayContaining([emojiData[0], emojiData[emojiData.length - 1]]))
    done()
  })

  it('all', async done => {
    const emojiData = await ECSpec.Emoji.all()
    expect(emojiData.length).toBeTruthy()
    done()
  })

  it('search', async done => {
    const emojiData = await ECSpec.Emoji.search('kissing')
    expect(emojiData).toContain(jasmine.objectContaining(emojiKissing))
    done()
  })

  it('starting', async done => {
    const emojiData = await ECSpec.Emoji.starting('kiss')
    expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
    done()
  })

  it('ending', async done => {
    const emojiData = await ECSpec.Emoji.ending('kiss')
    expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
    done()
  })

  it('tags', async done => {
    const emojiData = await ECSpec.Emoji.tags('weapon')
    expect(emojiData.length).toBeTruthy()
    done()
  })

  it('categories', async done => {
    const emojiData = await ECSpec.Emoji.categories('cosmos')
    expect(emojiData.length).toBeTruthy()
    done()
  })

  it('advenced', async done => {
    const emojiData = await ECSpec.Emoji.advanced({ categories: 'tools', tags: 'weapon', term: 'rifle' })
    expect(emojiData.length).toBeTruthy()
    done()
  })

  it('flush', async done => {
    await ECSpec.Emoji.flush()
    const emojiData = await ECSpec.Emoji.all()
    expect(emojiData.length).toBe(0)
    done()
  })
})
/* eslint-enable no-undef */
