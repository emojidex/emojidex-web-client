/* eslint-disable no-undef */
describe('EmojidexCategories', () => {
  beforeAll(done => {
    helperChains({
      functions: [clearStorage, helperBefore, getFacesEmoji],
      end: done
    })
  })

  it('getEmoji', async done => {
    const emojis = await ECSpec.Categories.getEmoji('faces')
    expect(ECSpec.Categories.calledData.categoryName).toEqual('faces')
    expect(emojis).toContain(jasmine.objectContaining(facesEmoji[0]))
    done()
  })

  it('next', async done => {
    await ECSpec.Categories.next()
    expect(ECSpec.Categories.calledData.categoryName).toEqual('faces')
    expect(ECSpec.Categories.curPage).toEqual(2)
    done()
  })

  it('prev', async done => {
    await ECSpec.Categories.prev()
    expect(ECSpec.Categories.calledData.categoryName).toEqual('faces')
    expect(ECSpec.Categories.curPage).toEqual(1)
    done()
  })

  it('sync', async done => {
    const categories = await ECSpec.Categories.sync()
    expect(categories.length).toBeTruthy()
    done()
  })

  it('all', async done => {
    const categories = await ECSpec.Categories.all()
    expect(categories).toBeTruthy()
    done()
  })
})
/* eslint-enable no-undef */
