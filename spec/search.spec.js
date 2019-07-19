/* eslint-disable no-undef */
describe('EmojidexSearch', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('search', done =>
    ECSpec.Search.search('kissing', emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining({ code: 'kissing', moji: '😗', unicode: '1f617', category: 'faces' }))
      done()
    })
  )

  it('starting', done =>
    ECSpec.Search.starting('kissing', emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKissing))
      done()
    })
  )

  it('ending', done =>
    ECSpec.Search.ending('kiss', emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
      done()
    })
  )

  it('tags', done =>
    ECSpec.Search.tags('', emojiData => {
      expect(emojiData).toBeTruthy()
      done()
    })
  )

  it('advanced: term', done =>
    ECSpec.Search.advanced({ term: 'kissing' }, emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining({ code: 'kissing', moji: '😗', unicode: '1f617', category: 'faces' }))
      done()
    })
  )

  it('advanced: categories', done =>
    ECSpec.Search.advanced({ term: 'kiss', categories: ['objects'] }, emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss))
      done()
    })
  )
  it('advanced: tags', done =>
    ECSpec.Search.advanced({ tags: ['GAKUEngine'] }, emojiData => {
      expect(emojiData).toContain(jasmine.objectContaining(gakuEngine))
      done()
    })
  )

  it('find: use cached emoji', done =>
    ECSpec.Search.find('kiss', emojiData => {
      expect(emojiData).toEqual(jasmine.objectContaining(emojiKiss))
      done()
    })
  )

  it('find: use ajax', done =>
    ECSpec.Search.find('dragon', emojiData => {
      expect(emojiData).toEqual(jasmine.objectContaining(emojiDragon))
      done()
    })
  )

  it('find: use ajax and auto escaping', done =>
    ECSpec.Search.find('thinking face(p)', emojiData => {
      expect(emojiData).toEqual(jasmine.objectContaining(emojiThinkingFaceP))
      done()
    })
  )

  it('find: not found', done =>
    ECSpec.Search.find('aaaaaaaa', response => {
      expect(response.statusText).toEqual('Not Found')
      done()
    })
  )

  return describe('Search and page transition', () => {
    beforeAll(done =>
      ECSpec.Search.starting('a', () => done())
    )

    it('next', done => {
      ECSpec.Search.searched.callback = function () {
        expect(ECSpec.Search.curPage).toEqual(2)
        done()
      }

      ECSpec.Search.next()
    })

    it('prev', done => {
      ECSpec.Search.searched.callback = function () {
        expect(ECSpec.Search.curPage).toEqual(1)
        done()
      }

      ECSpec.Search.prev()
    })
  })
})
/* eslint-enable no-undef */
