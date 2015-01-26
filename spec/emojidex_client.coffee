describe "EmojidexClient", ->
  ec = new EmojidexClient

  it "Defined EmojidexClient ?", ->
    expect(EmojidexClient).toBeDefined()

  describe "Mthods: emoji info", ->
    describe "for search", ->
      it "search", (done) ->
        ec.search "kiss", (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it "search: check data", ->
        kiss =
          code: 'kiss'
          moji: '💋'
          unicode: '1f48b'
          category: 'objects'
          tags: []

        expect(ec.results).toContain(kiss)

      it "search_sw", (done) ->
        ec.search_sw "", (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it "search_ew", (done) ->
        ec.search_ew "", (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

      it "tag_search", (done) ->
        ec.tag_search "", (emoji_data) ->
          expect(emoji_data).toBeTruthy()
          done()

      it "advanced_search", (done) ->
        ec.advanced_search "", [], [], (emoji_data) ->
          expect(emoji_data.length).toBeTruthy()
          done()

    it "user_emoji", (done) ->
      ec.user_emoji "emojidex", (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

    it "get_categories", (done) ->
      ec.get_categories (categories) ->
        expect(categories.length).toBeTruthy()
        done()

    it "get_index", (done) ->
      ec.get_index (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

    it "get_newest", (done) ->
      ec.get_newest (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

    it "get_popular", (done) ->
      ec.get_popular (emoji_data) ->
        expect(emoji_data.length).toBeTruthy()
        done()

  describe "Mthods: user info", ->
