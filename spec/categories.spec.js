/* eslint-disable no-undef */
describe('EmojidexCategories', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore, getFacesEmoji],
      end: done
    })
  )

  it('getEmoji', done =>
    ECSpec.Categories.getEmoji('faces', (emojis, calledData) => {
      expect(calledData.categoryName).toEqual('faces')
      expect(emojis).toContain(jasmine.objectContaining(facesEmoji[0]))
      done()
    })
  )

  it('next', done => {
    ECSpec.Categories.calledData.callback = function () {
      expect(ECSpec.Categories.curPage).toEqual(2)
      done()
    }

    ECSpec.Categories.next()
  })

  it('prev', done => {
    ECSpec.Categories.calledData.callback = function () {
      expect(ECSpec.Categories.curPage).toEqual(1)
      done()
    }

    ECSpec.Categories.prev()
  })

  it('sync', done =>
    ECSpec.Categories.sync(categories => {
      expect(categories.length).toBeTruthy()
      done()
    })
  )

  it('all', done =>
    ECSpec.Categories.all(categories => {
      expect(categories).toBeTruthy()
      done()
    })
  )
})
/* eslint-enable no-undef */
