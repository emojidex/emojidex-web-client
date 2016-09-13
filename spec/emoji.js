describe('EmojidexEmoji', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  describe('check update', function() {
    it('need update', done =>
      EC_spec.Data.storage.update('emojidex.seedUpdated', new Date('1/1/2016').toString()).then(() => {
        expect(EC_spec.Emoji.checkUpdate()).toBe(true);
        return done();
      }
      )
    
    );

    return it('unnecessary update', done =>
      EC_spec.Data.storage.update('emojidex.seedUpdated', new Date().toString()).then(() => {
        expect(EC_spec.Emoji.checkUpdate()).toBe(false);
        return done();
      }
      )
    
    );
  }
  );

  it('seed', done =>
    EC_spec.Indexes.static(['utf_emoji', 'extended_emoji'], 'en', emoji_data => {
      expect(EC_spec.Emoji._emoji_instance).toEqual(jasmine.arrayContaining([emoji_data[0], emoji_data[emoji_data.length - 1]]));
      return done();
    }
    )
  
  );

  it('all', function(done) {
    expect(EC_spec.Emoji.all().length).toBeTruthy();
    return done();
  }
  );

  it('search', done =>
    EC_spec.Emoji.search('kissing', function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kissing));
      return done();
    }
    )
  
  );

  it('starting', done =>
    EC_spec.Emoji.starting('kiss', function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kiss));
      return done();
    }
    )
  
  );

  it('ending', done =>
    EC_spec.Emoji.ending('kiss', function(emoji_data) {
      expect(emoji_data).toContain(jasmine.objectContaining(emoji_kiss));
      return done();
    }
    )
  
  );

  it('tags', () => expect(EC_spec.Emoji.tags('weapon').length).toBeTruthy()
  );

  it('categories', () => expect(EC_spec.Emoji.categories('cosmos').length).toBeTruthy()
  );

  it('advenced', function() {
    let searchs = {categories: 'tools', tags: 'weapon', term: 'rifle'};
    return expect(EC_spec.Emoji.advanced(searchs).length).toBeTruthy();
  }
  );

  return it('flush', done =>
    EC_spec.Emoji.flush().then(() => {
      expect(EC_spec.Emoji.all().length).toBe(0);
      return done();
    }
    )
  
  );
}
);
