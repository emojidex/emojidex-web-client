describe 'EmojidexClient', ->
  window.ec = new EmojidexClient

  it 'Defined EmojidexClient ?', ->
    expect(EmojidexClient).toBeDefined()

  describe 'Mthods: emoji info', ->
    describe 'for search', ->
      it 'search', (done) ->
        ec.search 'kiss', (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it 'search: check data', ->
        kiss =
          code: 'kiss'
          moji: '💋'
          unicode: '1f48b'
          category: 'objects'

        expect(ec.results).toContain(
          jasmine.objectContaining(kiss)
        )

      it 'search_sw', (done) ->
        ec.search_sw '', (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it 'search_ew', (done) ->
        ec.search_ew '', (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it 'tag_search', (done) ->
        ec.tag_search '', (emoji_data) ->
          expect(emoji_data).toBeTruthy()
          done()

      it 'advanced_search', (done) ->
        ec.advanced_search '', [], [], (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

    it 'user_emoji', (done) ->
      ec.user_emoji 'emojidex', (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

    it 'get_categories', (done) ->
      ec.get_categories (categories) ->
        expect(categories.length).toBeTruthy()
        done()

    it 'get_index', (done) ->
      ec.get_index (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

    it 'get_newest', (done) ->
      ec.get_newest (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

    it 'get_popular', (done) ->
      ec.get_popular (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

  describe 'Mthods: user info', ->
    test =
      auth_user: 'test'
      auth_token: '1798909355d57c9a93e3b82d275594e7c7c000db05021138'

    emojidex =
      code: 'emojidex'
      category: 'symbols'

    ec._set_auth_from_response(test)

    describe 'for favorites', ->
      it 'get_favorites', (done) ->
        ec.get_favorites (favorites)->
          expect(ec.favorites).toContain(
            jasmine.objectContaining(emojidex)
          )
          done()