/* eslint-disable no-undef */
describe('EmojidexData', () => {
  beforeAll(async done => {
    await helperChains([clearStorage, helperBeforeForEmojidexData])
    // await helperChains([clearStorage])
    // await helperChains([helperBeforeForEmojidexData])
    done()
  })

  it('has the Data class defined', () => expect(ECSpec.Data).toBeDefined())

  xdescribe('initialize', () => {
    it('first access to storage', done => {
      expect(ECSpec.Data.storage.isEmpty('emojidex')).toBe(false)
      done()
    })

    xdescribe('check initialize data', () => {
      it('emojidex.emoji', done => {
        expect(ECSpec.Data.storage.get('emojidex.emoji')).toEqual([])
        done()
      })
      it('emojidex.history', done => {
        expect(ECSpec.Data.storage.get('emojidex.history')).toEqual([])
        done()
      })
      it('emojidex.favorites', done => {
        expect(ECSpec.Data.storage.get('emojidex.favorites')).toEqual([])
        done()
      })
      it('emojidex.categories', done => {
        expect(ECSpec.Data.storage.get('emojidex.categories').length).toEqual(ECSpec.Categories._categories.length)
        done()
      })
      it('emojidex.auth_info', done => {
        expect(ECSpec.Data.storage.get('emojidex.auth_info')).toEqual(ECSpec.Data.defaultAuthInfo)
        done()
      })
      it('emojidex.moji_codes', async done => {
        const response = await axios.get(`${ECSpec.apiUrl}moji_codes`)
        expect(ECSpec.Data.storage.get('emojidex.moji_codes')).toEqual(response.data)
        done()
      })
    })

    it('after', async done => {
      expect(ECSpec.Data.storage.isEmpty('emojidex')).toBe(false)
      const keys = await ECSpec.Data.storage.keys('emojidex')
      expect(keys).toEqual(['moji_codes', 'emoji', 'history', 'favorites', 'categories', 'auth_info', 'moji_codes_updated'])
      expect(ECSpec.Data.storage.isSet('emojidex')).toBe(true)
      done()
    })

    it('clear', async done => {
      await ECSpec.Data.storage.clear()
      const data = await ECSpec.Data.storage.hub.get('emojidex')
      expect(data).toEqual(null)
      done()
    })
  })
})
/* eslint-enable no-undef */
