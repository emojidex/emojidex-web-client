describe 'EmojidexData', ->
  beforeAll (done) ->
    helperChains
      functions: [clearStorage, helperBeforeForEmojidexData]
      end: done

  it 'has the Data class defined', ->
    expect(EC_spec.Data).toBeDefined()

  describe 'initialize', ->
    it 'first access to storage', ->
      expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe false

    describe 'check initialize data', ->
      it 'emojidex.emoji', ->
        expect(EC_spec.Data.storage.get 'emojidex.emoji').toEqual([])
      it 'emojidex.history', ->
        expect(EC_spec.Data.storage.get 'emojidex.history').toEqual([])
      it 'emojidex.favorites', ->
        expect(EC_spec.Data.storage.get 'emojidex.favorites').toEqual([])
      # TODO: this example is not correct.
      # it 'emojidex.categories', ->
      #   expect(EC_spec.Data.storage.get 'emojidex.categories').toEqual([])
      it 'emojidex.auth_info', ->
        expect(EC_spec.Data.storage.get 'emojidex.auth_info').toEqual({status: 'none', user: '', token: null})

    it 'after', ->
      expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe false
      expect(EC_spec.Data.storage.keys('emojidex')).toEqual(['emoji', 'history', 'favorites', 'categories', 'auth_info', 'cdn_url'])
