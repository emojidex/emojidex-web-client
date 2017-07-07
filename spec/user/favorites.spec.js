describe('EmojidexUserFavorites', function() {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('get', done =>
    EC_spec.User.Favorites.get(function(favorites) {
      expect(favorites).toContain(
        jasmine.objectContaining(emoji_emoji)
      );
      done();
    })
  );

  it('all', done => {
    setTimeout(() => {  // Favorites.sync()が終わっていない時があるので
      EC_spec.User.Favorites.all(favorites => {
        expect(favorites).toContain(
          jasmine.objectContaining(emoji_emoji)
        );
        done();
      })
    }, 2000);
  });

  describe('Favorites pages [require premium user]', function() {
    if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    );

    it('next/prev', done => {
      EC_spec.limit = 5;
      setTimeout(() => {  // Favorites.sync()が終わっていない時があるので
        EC_spec.User.Favorites.next(favorites => {
          expect(EC_spec.User.Favorites.cur_page).toEqual(2);
          EC_spec.User.Favorites.prev(favorites => {
            expect(EC_spec.User.Favorites.cur_page).toEqual(1);
            done();
          });
        });
      }, 2000);
    });
  });

  // it 'set_favorites', (done) ->
  //   EC_spec.set_favorites 'emoji', (favorites)->
  //     expect(EC_spec.favorites).toContain(
  //       jasmine.objectContaining(emoji)
  //     )
  //     done()
  //
  // Not working on PhantomJS, browser is OK.
  // it 'unset_favorites', (done) ->
  //   EC_spec.unset_favorites 'emoji', (favorites)->
  //     expect(EC_spec.favorites).not.toContain(
  //       jasmine.objectContaining(emoji)
  //     )
  //     done()
});
