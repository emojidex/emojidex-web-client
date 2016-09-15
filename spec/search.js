describe('EmojidexSearch', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('search', done =>
    EC_spec.Search.search('kissing', function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kissing));
      done();
    })
  );

  it('starting', done =>
    EC_spec.Search.starting('kiss', function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kiss));
      done();
    })
  );

  it('ending', done =>
    EC_spec.Search.ending('kiss', function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kiss));
      done();
    })
  );

  it('tags', done =>
    EC_spec.Search.tags('', function(emoji_data) {
      expect(emoji_data).toBeTruthy();
      done();
    })
  );

  it('advanced: term', done =>
    EC_spec.Search.advanced({term: 'kissing'}, function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kissing));
      done();
    })
  );

  it('advanced: categories', done =>
    EC_spec.Search.advanced({term: 'kiss', categories: ["objects"]}, function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kiss));
      done();
    })
  );

  it('find: use cached emoji', done =>
    EC_spec.Search.find('kiss', function(emoji_data) {
      expect(emoji_data).toEqual(jasmine.objectContaining(emoji_kiss));
      done();
    })
  );

  it('find: use ajax', done =>
    EC_spec.Search.find('dragon', function(emoji_data) {
      expect(emoji_data).toEqual(jasmine.objectContaining(emoji_dragon));
      done();
    })
  );

  it('find: not found', done =>
    EC_spec.Search.find('aaaaaaaa', function(response) {
      expect(response.statusText).toEqual('Not Found');
      done();
    })
  );

  return describe('Search and page transition', function() {
    beforeAll(done =>
      EC_spec.Search.starting('a', () => done())
    );

    it('next', function(done) {
      EC_spec.Search.searched.callback = function() {
        expect(EC_spec.Search.cur_page).toEqual(2);
        done();
      };
      EC_spec.Search.next();
    });

    it('prev', function(done) {
      EC_spec.Search.searched.callback = function() {
        expect(EC_spec.Search.cur_page).toEqual(1);
        done();
      };
      EC_spec.Search.prev();
    });
  });
});

  // it 'advanced: tags', (done) ->
  //   EC_spec.Search.advanced '', ["Star Trek"], [], (emoji_data) ->
  //     console.dir emoji_data
  //     expect(emoji_data).toContain(jasmine.objectContaining emoji_kiss)
  //     done()
