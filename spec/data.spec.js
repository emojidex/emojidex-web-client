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
    it('first access to storage', () => expect(ECSpec.Data.storage.isEmpty('emojidex')).toBe(false))

    describe('check initialize data', () => {
      it('emojidex.emoji', () => expect(ECSpec.Data.storage.get('emojidex.emoji')).toEqual([])
      )
      // TODO: this example is not correct.
      // it('emojidex.history', () => expect(ECSpec.Data.storage.get('emojidex.history')).toEqual([])
      // );
      // it('emojidex.favorites', () => expect(ECSpec.Data.storage.get('emojidex.favorites')).toEqual([])
      // );
      // it 'emojidex.categories', ->
      //   expect(ECSpec.Data.storage.get 'emojidex.categories').toEqual([])
      // it('emojidex.auth_info', () =>
      //   expect(ECSpec.Data.storage.get('emojidex.auth_info')).toEqual({status: 'none', user: '',
      //   token: null, r18: false, premium: false, premium_exp: null, pro: false, pro_exp: null})
      // );

      it('emojidex.moji_codes', done => {
        axios.get(`${ECSpec.apiUrl}moji_codes`).then(response => {
          expect(ECSpec.Data.storage.get('emojidex.moji_codes')).toEqual(response.data)
          done()
        })
      })
    })

    it('after', () => {
      expect(ECSpec.Data.storage.isEmpty('emojidex')).toBe(false)
      expect(ECSpec.Data.storage.keys('emojidex')).toEqual(['moji_codes', 'emoji', 'history', 'favorites', 'categories', 'auth_info', 'moji_codes_updated'])
    })
  })
})
/* eslint-enable no-undef */
