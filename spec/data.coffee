describe 'EmojidexData', ->
  beforeAll (done) ->
    helperChains
      functions: [helperBeforeForEmojidexData]
      end: done

  it 'has the Data class defined', ->
    expect(EC_spec.Data).toBeDefined()

  describe 'initialize', ->
    it 'first access to storage', (done)->
      timer_option =
        callback: ->
          if EC_spec.Data.hub_data?.cdn_url?
            EC_spec.Data.storage.isEmpty('emojidex').then (flag)->
              expect(flag).toBe false
              done()
          else
            spec_timer timer_option
      spec_timer timer_option

    it 'check initialize data', (done)->
      EC_spec.Data.storage.get('emojidex.emoji').then((data)->
        expect(data).toEqual([])

      ).then(->
        EC_spec.Data.storage.get 'emojidex.history'
      ).then((data)->
        expect(data).toEqual([])

      ).then(->
        EC_spec.Data.storage.get 'emojidex.favorites'
      ).then((data)->
        expect(data).toEqual([])

      ).then(->
        EC_spec.Data.storage.get 'emojidex.categories'
      ).then((data)->
        expect(data).toEqual([])

      ).then(->
        EC_spec.Data.storage.get 'emojidex.auth_info'
      ).then (data)->
        expect(data).toEqual({status: 'none', user: '', token: null})
        done()

    it 'after', (done)->
      EC_spec = new EmojidexClient
      EC_spec.Data.storage.isEmpty('emojidex').then((flag)->
        expect(flag).toBe false

      ).then(->
        EC_spec.Data.storage.keys('emojidex')
      ).then (keys)->
        expect(keys).toEqual(['emoji', 'history', 'favorites', 'categories', 'auth_info', 'cdn_url'])
        done()
