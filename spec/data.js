describe('EmojidexData', function() {
  beforeAll(done =>
    helperChains({
      functions: [helperBeforeForEmojidexData],
      end: done
    })
  );

  it('has the Data class defined', () => expect(EC_spec.Data).toBeDefined());

  describe('initialize', function() {
    it('first access to storage', () => expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe(false));

    describe('check initialize data', function() {
      it('emojidex.emoji', () => expect(EC_spec.Data.storage.get('emojidex.emoji')).toEqual([])
      );
      it('emojidex.history', () => expect(EC_spec.Data.storage.get('emojidex.history')).toEqual([])
      );
      it('emojidex.favorites', () => expect(EC_spec.Data.storage.get('emojidex.favorites')).toEqual([])
      );
      // TODO: this example is not correct.
      // it 'emojidex.categories', ->
      //   expect(EC_spec.Data.storage.get 'emojidex.categories').toEqual([])
      it('emojidex.auth_info', () =>
        expect(EC_spec.Data.storage.get('emojidex.auth_info')).toEqual({status: 'none', user: '',
        token: null, r18: false, premium: false, premium_exp: null, pro: false, pro_exp: null})
      );

      it('emojidex.moji_codes', function() {
          //expect(EC_spec.Data.storage.get('emojidex.moji_data.moji_codes').moji_string).toBeTruthy();
          //expect(EC_spec.Data.storage.get('emojidex.moji_data.moji_codes').moji_array.length).toBeTruthy();
          //expect(EC_spec.Data.storage.get('emojidex.moji_data.moji_codes').moji_index.keys.length).toBeTruthy();

          expect(EC_spec.Data.storage.get('emojidex.moji_codes.moji_string')).toEqual("");
          expect(EC_spec.Data.storage.get('emojidex.moji_codes.moji_array')).toEqual([]);
          expect(EC_spec.Data.storage.get('emojidex.moji_codes.moji_index')).toEqual({});
      });
    });

    it('after', function() {
      expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe(false);
      expect(EC_spec.Data.storage.keys('emojidex')).toEqual(['moji_codes', 'emoji', 'history', 'favorites', 'categories', 'auth_info', 'cdn_url']);
    });
  });
});
