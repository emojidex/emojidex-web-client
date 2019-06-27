describe('EmojidexSearch', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('search', done =>
    EC_spec.Search.search('kissing', function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining({ code: 'kissing', moji: '😗', unicode: '1f617', category: 'faces' }));
      done();
    })
  );

  it('starting', done =>
    EC_spec.Search.starting('kissing', function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKissing));
      done();
    })
  );

  it('ending', done =>
    EC_spec.Search.ending('kiss', function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss));
      done();
    })
  );

  it('tags', done =>
    EC_spec.Search.tags('', function(emojiData) {
      expect(emojiData).toBeTruthy();
      done();
    })
  );

  it('advanced: term', done =>
    EC_spec.Search.advanced({term: 'kissing'}, function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining({ code: 'kissing', moji: '😗', unicode: '1f617', category: 'faces' }));
      done();
    })
  );

  it('advanced: categories', done =>
    EC_spec.Search.advanced({ term: 'kiss', categories: ["objects"] }, function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss));
      done();
    })
  );

  it('find: use cached emoji', done =>
    EC_spec.Search.find('kiss', function(emojiData) {
      expect(emojiData).toEqual(jasmine.objectContaining(emojiKiss));
      done();
    })
  );

  it('find: use ajax', done =>
    EC_spec.Search.find('dragon', function(emojiData) {
      expect(emojiData).toEqual(jasmine.objectContaining(emoji_dragon));
      done();
    })
  );

  it('find: use ajax and auto escaping', done =>
    EC_spec.Search.find('thinking face(p)', function(emojiData) {
      expect(emojiData).toEqual(jasmine.objectContaining(emoji_thinking_face_p));
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
        expect(EC_spec.Search.curPage).toEqual(2);
        done();
      };
      EC_spec.Search.next();
    });

    it('prev', function(done) {
      EC_spec.Search.searched.callback = function() {
        expect(EC_spec.Search.curPage).toEqual(1);
        done();
      };
      EC_spec.Search.prev();
    });
  });
});

  // it 'advanced: tags', (done) ->
  //   EC_spec.Search.advanced '', ["Star Trek"], [], (emojiData) ->
  //     console.dir emojiData
  //     expect(emojiData).toContain(jasmine.objectContaining emojiKiss)
  //     done()
