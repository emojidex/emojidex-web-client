describe('EmojidexCategories', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore, getFacesEmoji],
      end: done
    })
  );

  it('getEmoji', done =>
    EC_spec.Categories.getEmoji('faces', function(emojis, called_data) {
      expect(called_data.category_name).toEqual('faces');
      expect(emojis).toContain(jasmine.objectContaining(faces_emoji[0]));
      done();
    })
  );

  it('next', function(done) {
    EC_spec.Categories.called_data.callback = function() {
      expect(EC_spec.Categories.cur_page).toEqual(2);
      done();
    };
    EC_spec.Categories.next();
  });

  it('prev', function(done) {
    EC_spec.Categories.called_data.callback = function() {
      expect(EC_spec.Categories.cur_page).toEqual(1);
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
