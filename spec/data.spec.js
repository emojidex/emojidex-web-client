/* eslint-disable no-undef */
describe('EmojidexData', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBeforeForEmojidexData],
      end: done
    })
  )

  it('has the Data class defined', () => expect(ECSpec.Data).toBeDefined())

  describe('initialize', () => {
    it('first access to storage', done => {
      expect(ECSpec.Data.storage.isEmpty('emojidex')).toBe(false)
      done()
    })

    describe('check initialize data', () => {
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
      it('emojidex.moji_codes', done => {
        axios.get(`${ECSpec.apiUrl}moji_codes`).then(response => {
          expect(ECSpec.Data.storage.get('emojidex.moji_codes')).toEqual(response.data)
          done()
        })
      })
    })

    it('after', done => {
      expect(ECSpec.Data.storage.isEmpty('emojidex')).toBe(false)
      expect(ECSpec.Data.storage.keys('emojidex')).toEqual(['moji_codes', 'emoji', 'history', 'favorites', 'categories', 'auth_info', 'moji_codes_updated'])
      expect(ECSpec.Data.storage.isSet('emojidex')).toBe(true)
      done()
    })
    
    it('clear', done => {
      ECSpec.Data.storage.clear().then(() => {
        return ECSpec.Data.storage.hub.get('emojidex')
      }).then(data => {
        expect(data).toEqual(null)
        done()
      })
    })
  })
})
/* eslint-enable no-undef */
