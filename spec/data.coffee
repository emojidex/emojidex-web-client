describe 'EmojidexData', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBeforeForEmojidexData]
      end: done

  it 'has the Data class defined', ->
    expect(EC_spec.Data).toBeDefined()

  describe 'initialize', ->
    it 'first access to storage', ->
      expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe false

    it 'check initialize data', ->
      expect(EC_spec.Data.storage.get 'emojidex.emoji').toEqual([])
      expect(EC_spec.Data.storage.get 'emojidex.history').toEqual([])
      expect(EC_spec.Data.storage.get 'emojidex.favorites').toEqual([])
      expect(EC_spec.Data.storage.get 'emojidex.categories').toEqual([])
      expect(EC_spec.Data.storage.get 'emojidex.auth_info').toEqual({status: 'none', user: '', token: null})

    it 'after', ->
      expect(EC_spec.Data.storage.isEmpty('emojidex')).toBe false
      expect(EC_spec.Data.storage.keys('emojidex')).toEqual(['emoji', 'history', 'favorites', 'categories', 'auth_info', 'cdn_url'])
