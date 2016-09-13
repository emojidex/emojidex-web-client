describe('EmojidexIndexes', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore, getExtendedEmojiData],
      end: done
    })
  );

  it('user', done =>
    EC_spec.Indexes.user('emojidex', emoji_data => {
      expect(emoji_data).toContain(emoji_emojidex[0]);
      return done();
    }
    )
  
  );

  it('index', done =>
    EC_spec.Indexes.index(function(emoji_data) {
      expect(emoji_data.length).toBeTruthy();
      return done();
    })
  
  );

  it('static', done =>
    EC_spec.Indexes.static(['utf_emoji', 'extended_emoji'], 'en', function(emoji_data) {
      expect(EC_spec.Emoji._emoji_instance).toEqual(jasmine.arrayContaining([emoji_data[0], emoji_data[emoji_data.length - 1]]));
      return done();
    }
    )
  
  );

  it('select', done =>
    EC_spec.Indexes.select('kiss', function(emoji_data) {
      expect(emoji_data.code).toEqual('kiss');
      return done();
    }
    )
  
  );

  it('next', function(done) {
    EC_spec.Indexes.indexed.callback = function() {
      expect(EC_spec.Indexes.cur_page).toEqual(2);
      return done();
    };
    return EC_spec.Indexes.next();
  }
  );

  it('prev', function(done) {
    EC_spec.Indexes.indexed.callback = function() {
      expect(EC_spec.Indexes.cur_page).toEqual(1);
      return done();
    };
    return EC_spec.Indexes.prev();
  }
  );


  it('can not get newest index because user is not premium', done =>
    EC_spec.Indexes.newest(function(emoji_data) {
      expect(emoji_data.length).toEqual(0);
      return done();
    })
  
  );

  it('can not get popular index because user is not premium', done =>
    EC_spec.Indexes.popular(function(emoji_data) {
      expect(emoji_data.length).toEqual(0);
      return done();
    })
  
  );

  return describe('[Premium user only]', function() {
    if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
    beforeEach(done => {
      return helperChains({
        functions: [setPremiumUser],
        end: done
      });
    }
    );

    it('gets newest index', done =>
      EC_spec.Indexes.newest(function(emoji_data) {
        expect(emoji_data.length).toBeTruthy();
        return done();
      })
    
    );

    return it('gets popular index', done =>
      EC_spec.Indexes.popular(function(emoji_data) {
        expect(emoji_data.length).toBeTruthy();
        return done();
      })
    
    );
  }
  );
}
);
