describe('EmojidexData', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBeforeForEmojidexData],
      end: done
    })
  );

  it('has the Data class defined', () => expect(EC_spec.Data).toBeDefined());

  describe('initialize', function() {
    it('first access to storage', () => expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe(false));

    describe('check initialize data', function() {
      it('emojidex.emoji', () => expect(EC_spec.Data.storage.get('emojidex.emoji')).toEqual([])
      );
      // TODO: this example is not correct.
      // it('emojidex.history', () => expect(EC_spec.Data.storage.get('emojidex.history')).toEqual([])
      // );
      // it('emojidex.favorites', () => expect(EC_spec.Data.storage.get('emojidex.favorites')).toEqual([])
      // );
      // it 'emojidex.categories', ->
      //   expect(EC_spec.Data.storage.get 'emojidex.categories').toEqual([])
      // it('emojidex.auth_info', () =>
      //   expect(EC_spec.Data.storage.get('emojidex.auth_info')).toEqual({status: 'none', user: '',
      //   token: null, r18: false, premium: false, premium_exp: null, pro: false, pro_exp: null})
      // );

      it('emojidex.moji_codes', function(done) {
        axios.get(`${EC_spec.apiUrl}moji_codes`).then(response => {
          expect(EC_spec.Data.storage.get('emojidex.moji_codes')).toEqual(response.data);
          done();
        })
      });
    });

    it('after', function() {
      expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe(false);
      expect(EC_spec.Data.storage.keys('emojidex')).toEqual(['moji_codes', 'emoji', 'history', 'favorites', 'categories', 'auth_info', 'moji_codes_updated']);
    });
  });
});
