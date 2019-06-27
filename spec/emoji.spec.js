describe('EmojidexEmoji', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  describe('check update', function() {
    it('need update', done => {
      setTimeout(() => {  // userDataSyncが終わっていないことがあるため
        EC_spec.Data.storage.update('emojidex.seedUpdated', new Date('1/1/2016').toString()).then(() => {
          expect(EC_spec.Emoji.checkUpdate()).toBe(true);
          done();
        });
      }, 1000);
    });

    it('unnecessary update', done =>
      EC_spec.Data.storage.update('emojidex.seedUpdated', new Date().toString()).then(() => {
        expect(EC_spec.Emoji.checkUpdate()).toBe(false);
        done();
      })
    );
  });

  it('seed', done =>
    EC_spec.Emoji.seed(emojiData => {
      expect(EC_spec.Emoji._emojiInstance).toEqual(jasmine.arrayContaining([emojiData[0], emojiData[emojiData.length - 1]]));
      done();
    })
  );

  it('all', function(done) {
    expect(EC_spec.Emoji.all().length).toBeTruthy();
    done();
  });

  it('search', done =>
    EC_spec.Emoji.search('kissing', function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining({ code: 'kissing', moji: '😗', unicode: '1f617', category: 'faces' }));
      done();
    })
  );

  it('starting', done =>
    EC_spec.Emoji.starting('kiss', function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss));
      done();
    })
  );

  it('ending', done =>
    EC_spec.Emoji.ending('kiss', function(emojiData) {
      expect(emojiData).toContain(jasmine.objectContaining(emojiKiss));
      done();
    })
  );

  it('tags', () => expect(EC_spec.Emoji.tags('weapon').length).toBeTruthy());

  it('categories', () => expect(EC_spec.Emoji.categories('cosmos').length).toBeTruthy());

  it('advenced', function() {
    let searchs = {categories: 'tools', tags: 'weapon', term: 'rifle'};
    expect(EC_spec.Emoji.advanced(searchs).length).toBeTruthy();
  });

  it('flush', done =>
    EC_spec.Emoji.flush().then(() => {
      expect(EC_spec.Emoji.all().length).toBe(0);
      done();
    })
  );
});
