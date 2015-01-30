emoji_kiss =
  code: 'kiss'
  moji: '💋'
  unicode: '1f48b'
  category: 'objects'

emoji_emojidex =
  code: 'emojidex'
  category: 'symbols'

emoji_emoji =
  code: 'emoji'
  category: 'symbols'

user_info =
  auth_user: 'test'
  auth_token: '1798909355d57c9a93e3b82d275594e7c7c000db05021138'

window.ec = new EmojidexClient
ec.User._set_auth_from_response(user_info)

describe 'EmojidexClient', ->
  it 'Defined EmojidexClient ?', ->
    expect(EmojidexClient).toBeDefined()

describe 'EmojidexSearch', ->
  it 'search', (done) ->
    ec.Search.search 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'starting', (done) ->
    ec.Search.starting 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'ending', (done) ->
    ec.Search.ending 'kiss', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

  it 'tags', (done) ->
    ec.Search.tags '', (emoji_data) ->
      expect(emoji_data).toBeTruthy()
      done()

  it 'padvanced', (done) ->
    ec.Search.advanced 'kiss', [], [], (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_kiss
      )
      done()

describe 'EmojidexIndexes', ->
  it 'user', (done) ->
    ec.Indexes.user 'emojidex', (emoji_data) ->
      expect(emoji_data).toContain(
        jasmine.objectContaining emoji_emojidex
      )
      done()

  it 'index', (done) ->
    ec.Indexes.index (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

  it 'newest', (done) ->
    ec.Indexes.newest (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

  it 'popular', (done) ->
    ec.Indexes.popular (emoji_data) ->
      expect(emoji_data.length).toBeTruthy()
      done()

describe 'EmojidexCategories', ->
  it 'sync', (done) ->
    ec.Categories.sync (categories) ->
      expect(categories.length).toBeTruthy()
      done()

describe 'EmojidexUserFavorites', ->
  it 'get', (done) ->
    ec.User.Favorites.get (favorites)->
      expect(favorites).toContain(
        jasmine.objectContaining(emoji_emojidex)
      )
      done()

  it 'all', ->
    expect(ec.User.Favorites.all()).toContain(
      jasmine.objectContaining(emoji_emojidex)
    )

  # it 'set_favorites', (done) ->
  #   ec.set_favorites 'emoji', (favorites)->
  #     expect(ec.favorites).toContain(
  #       jasmine.objectContaining(emoji)
  #     )
  #     done()

  # Not working on PhantomJS, browser is OK.
  # it 'unset_favorites', (done) ->
  #   ec.unset_favorites 'emoji', (favorites)->
  #     expect(ec.favorites).not.toContain(
  #       jasmine.objectContaining(emoji)
  #     )
  #     done()
