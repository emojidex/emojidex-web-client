describe('EmojidexCategories', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore, getFacesEmoji],
      end: done
    })
  );

  it('getEmoji', done =>
    EC_spec.Categories.getEmoji('faces', function(emojis, calledData) {
      expect(calledData.categoryName).toEqual('faces');
      expect(emojis).toContain(jasmine.objectContaining(faces_emoji[0]));
      done();
    })
  );

  it('next', function(done) {
    EC_spec.Categories.calledData.callback = function() {
      expect(EC_spec.Categories.curPage).toEqual(2);
      done();
    };
    EC_spec.Categories.next();
  });

  it('prev', function(done) {
    EC_spec.Categories.calledData.callback = function() {
      expect(EC_spec.Categories.curPage).toEqual(1);
      done();
    };
    EC_spec.Categories.prev();
  });

  it('sync', done =>
    EC_spec.Categories.sync(function(categories) {
      expect(categories.length).toBeTruthy();
      done();
    })
  );

  it('all', done =>
    EC_spec.Categories.all(function(categories) {
      expect(categories).toBeTruthy();
      done();
    })
  );
});
