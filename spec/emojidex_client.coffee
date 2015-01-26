describe 'EmojidexClient', ->
  window.ec = new EmojidexClient

  it 'Defined EmojidexClient ?', ->
    expect(EmojidexClient).toBeDefined()

  describe 'Mthods: emoji info', ->
    describe 'for search', ->
      it 'searches', (done) ->
        ec.Search.search 'kiss', (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it 'searches (containing)', ->
        kiss =
          code: 'kiss'
          moji: '💋'
          unicode: '1f48b'
          category: 'objects'

        expect(ec.results).toContain(
          jasmine.objectContaining(kiss)
        )

      it 'searches starting with', (done) ->
        ec.Search.starting '', (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it 'searches ending with', (done) ->
        ec.Search.ending '', (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it 'searches tags', (done) ->
        ec.Search.tags '', (emoji_data) ->
          expect(emoji_data).toBeTruthy()
          done()

      it 'performs and advanced search', (done) ->
        ec.Search.advanced '', [], [], (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

#    it 'user_emoji', (done) ->
#      ec.user_emoji 'emojidex', (emoji_data) ->
#        expect(emoji_data.length).toBeTruthy()
#        done()
#
#    it 'get_categories', (done) ->
#      ec.get_categories (categories) ->
#        expect(categories.length).toBeTruthy()
#        done()
#
#    it 'get_index', (done) ->
#      ec.get_index (emoji_data) ->
#        expect(emoji_data.length).toBeTruthy()
#        done()
#
#    it 'get_newest', (done) ->
#      ec.get_newest (emoji_data) ->
#        expect(emoji_data.length).toBeTruthy()
#        done()
#
#    it 'get_popular', (done) ->
#      ec.get_popular (emoji_data) ->
#        expect(emoji_data.length).toBeTruthy()
#        done()
#
#  describe 'Mthods: user info', ->
#    test =
#      auth_user: 'test'
#      auth_token: '1798909355d57c9a93e3b82d275594e7c7c000db05021138'
#
#    emojidex =
#      code: 'emojidex'
#      category: 'symbols'
#
#    emoji =
#      code: 'emoji'
#      category: 'symbols'
#
#    ec._set_auth_from_response(test)
#
#    describe 'for favorites', ->
#      it 'get_favorites', (done) ->
#        ec.get_favorites (favorites)->
#          expect(ec.favorites).toContain(
#            jasmine.objectContaining(emojidex)
#          )
#          done()
#
#      # it 'set_favorites', (done) ->
#      #   ec.set_favorites 'emoji', (favorites)->
#      #     expect(ec.favorites).toContain(
#      #       jasmine.objectContaining(emoji)
#      #     )
#      #     done()
#
#      # Not working on PhantomJS, browser is OK.
#      # it 'unset_favorites', (done) ->
#      #   ec.unset_favorites 'emoji', (favorites)->
#      #     expect(ec.favorites).not.toContain(
#      #       jasmine.objectContaining(emoji)
#      #     )
#      #     done()
