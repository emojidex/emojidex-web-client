describe('EmojidexIndexes', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore, getExtendedEmojiData],
      end: done
    })
  );

  it('user', done =>
    EC_spec.Indexes.user('emojidex', emojiData => {
      expect(emojiData).toContain(emojiEmojidex[0]);
      done();
    })
  );

  it('index', done =>
    EC_spec.Indexes.index(function(emojiData) {
      expect(emojiData.length).toBeTruthy();
      done();
    })
  );

  it('static', done =>
    EC_spec.Indexes.static(['utf_emoji', 'extended_emoji'], 'en', function(emojiData) {
      expect(EC_spec.Emoji._emojiInstance).toEqual(jasmine.arrayContaining([emojiData[0], emojiData[emojiData.length - 1]]));
      done();
    })
  );

  it('select', done =>
    EC_spec.Indexes.select('kiss', function(emojiData) {
      expect(emojiData.code).toEqual('kiss');
      done();
    })
  );

  it('next', function(done) {
    EC_spec.Indexes.indexed.callback = function() {
      expect(EC_spec.Indexes.curPage).toEqual(2);
      done();
    };
    EC_spec.Indexes.next();
  });

  it('prev', function(done) {
    EC_spec.Indexes.indexed.callback = function() {
      expect(EC_spec.Indexes.curPage).toEqual(1);
      done();
    };
    EC_spec.Indexes.prev();
  });


  it('can not get newest index because user is not premium', done =>
    EC_spec.Indexes.newest(function(emojiData) {
      expect(emojiData.length).toEqual(0);
      done();
    })
  );

  it('can not get popular index because user is not premium', done =>
    EC_spec.Indexes.popular(function(emojiData) {
      expect(emojiData.length).toEqual(0);
      done();
    })
  );

  describe('[Premium user only]', function() {
    if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
    beforeEach(done => {
      helperChains({
        functions: [setPremiumUser],
        end: done
      });
    });

    it('gets newest index', done =>
      EC_spec.Indexes.newest(function(emojiData) {
        expect(emojiData.length).toBeTruthy();
        done();
      })
    );

    it('gets popular index', done =>
      EC_spec.Indexes.popular(function(emojiData) {
        expect(emojiData.length).toBeTruthy();
        done();
      })
    );
  });
});
