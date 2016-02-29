describe 'EmojidexData', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBeforeForEmojidexData]
      end: done

  it 'has the Data class defined', ->
    expect(EC_spec.Data).toBeDefined()

  describe 'initialize', ->
    it 'first access to storage', (done)->
      EC_spec.Data.storage.isEmpty('emojidex').then((flag)->
        expect(flag).toBe(false)
        done()

      )
      # ).then(->
      #   EC_spec.Data.storage.get 'emojidex.emoji'
      # ).then((data)->
      #   expect(data).toEqual([])
      #
      # ).then(->
      #   EC_spec.Data.storage.get 'emojidex.history'
      # ).then((data)->
      #   expect(data).toEqual([])
      #
      # ).then(->
      #   EC_spec.Data.storage.get 'emojidex.favorites'
      # ).then((data)->
      #   expect(data).toEqual([])
      #
      # ).then(->
      #   EC_spec.Data.storage.get 'emojidex.categories'
      # ).then((data)->
      #   expect(data).toEqual([])
      #
      # ).then(->
      #   EC_spec.Data.storage.get 'emojidex.auth_info'
      # ).then (data)->
      #   expect(data).toEqual({status: 'none', user: '', token: null})
      #   done()

    # it 'after', ->
    #   EC_spec = new EmojidexClient
    #   expect(EC_spec.Data.storage.isEmpty 'emojidex').toBe(false)
    #   expect(EC_spec.Data.storage.keys 'emojidex').toEqual(['emoji', 'history', 'favorites', 'categories', 'auth_info'])
