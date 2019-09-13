/* eslint-disable no-undef */
describe('EmojidexCustomizations', () => {
  beforeAll(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  it('get', async done => {
    const customizationEmojis = await ECSpec.Customizations.get()
    expect(customizationEmojis.length).toBeTruthy()
    const result = customizationEmojis.every(emoji => {
      return emoji.customizations.length
    })
    expect(result).toBeTruthy()
    done()
  })

  describe('Customizations pages', () => {
    beforeAll(async done => {
      ECSpec.limit = 1
      await ECSpec.Customizations.get()
      done()
    })

    it('next/prev', async done => {
      await ECSpec.Customizations.next()
      expect(ECSpec.Customizations.curPage).toEqual(2)
      await ECSpec.Customizations.prev()
      expect(ECSpec.Customizations.curPage).toEqual(1)
      done()
    })
  })
})
/* eslint-enable no-undef */
