describe 'EmojidexData', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBeforeForEmojidexData]
      end: done

  it 'has the Data class defined', ->
    expect(EC.Data).toBeDefined()

  describe 'initialize', ->
    it 'first access to storage', ->
      expect(EC.Data.storage.isEmpty 'emojidex').toBe(false)
      expect(EC.Data.storage.get 'emojidex.emoji').toEqual([])
      expect(EC.Data.storage.get 'emojidex.history').toEqual([])
      expect(EC.Data.storage.get 'emojidex.favorites').toEqual([])
      expect(EC.Data.storage.get 'emojidex.categories').toEqual([])
      expect(EC.Data.storage.get 'emojidex.auth_info').toEqual({status: 'none', user: '', token: null})

    it 'after', ->
      EC = new EmojidexClient
      expect(EC.Data.storage.isEmpty 'emojidex').toBe(false)
      expect(EC.Data.storage.keys 'emojidex').toEqual(['emoji', 'history', 'favorites', 'categories', 'auth_info'])
