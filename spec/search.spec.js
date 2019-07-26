/* eslint-disable no-undef */
describe('EmojidexSearch', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('search', async done => {
    const emojiData = await ECSpec.Search.search('kissing')
    expect(emojiData).toContain(jasmine.objectContaining(emojiKissing))
    done()
  })

  it('starting', async done => {
    const emojiData = await ECSpec.Search.starting('kissing')
    expect(emojiData).toContain(jasmine.objectContaining(emojiKissing))
    done()
  })

  it('ending', async done => {
    const emojiData = await ECSpec.Search.ending('kiss')
    expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
    done()
  })

  it('tags', async done => {
    const emojiData = await ECSpec.Search.tags('GAKUEngine')
    expect(emojiData).toBeTruthy(jasmine.objectContaining(gakuEngine))
    done()
  })

  it('advanced: term', async done => {
    const emojiData = await ECSpec.Search.advanced({ term: 'kissing' })
    expect(emojiData).toContain(jasmine.objectContaining(emojiKissing))
    done()
  })

  it('advanced: categories', async done => {
    const emojiData = await ECSpec.Search.advanced({ term: 'kiss', categories: ['objects'] })
    expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
    done()
  })

  it('advanced: tags', async done => {
    const emojiData = await ECSpec.Search.advanced({ tags: ['GAKUEngine'] })
    expect(emojiData).toContain(jasmine.objectContaining(gakuEngine))
    done()
  })

  it('find: use cached emoji', async done => {
    const emojiData = await ECSpec.Search.find('kiss')
    expect(emojiData).toEqual(jasmine.objectContaining(emojiKiss))
    done()
  })

  it('find: use ajax', async done => {
    const emojiData = await ECSpec.Search.find('dragon')
    expect(emojiData).toEqual(jasmine.objectContaining(emojiDragon))
    done()
  })

  it('find: use ajax and auto escaping', async done => {
    const emojiData = await ECSpec.Search.find('thinking face(p)')
    expect(emojiData).toEqual(jasmine.objectContaining(emojiThinkingFaceP))
    done()
  })

  it('find: not found', async done => {
    const response = await ECSpec.Search.find('aaaaaaaa')
    expect(response.statusText).toEqual('Not Found')
    done()
  })

  return describe('Search and page transition', () => {
    beforeAll(async done => {
      await ECSpec.Search.starting('a')
      done()
    })

    it('next', async done => {
      await ECSpec.Search.next()
      expect(ECSpec.Search.curPage).toEqual(2)
      done()
    })

    it('prev', async done => {
      await ECSpec.Search.prev()
      expect(ECSpec.Search.curPage).toEqual(1)
      done()
    })
  })
})
/* eslint-enable no-undef */
