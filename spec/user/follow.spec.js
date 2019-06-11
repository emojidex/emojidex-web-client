describe('EmojidexUserFollow', function() {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it ('get following', done => {
    EC_spec.User.Follow.getFollowing(following => {
      expect(following).toEqual(jasmine.any(Array));
      done();
    });
  });

  it ('add following', done => {
    pending('Delete API is not working');
    EC_spec.User.Follow.addFollowing('test', following => {
      expect(following).toContain('test');
      done();
    });
  });

  it ('delete following', done => {
    pending('503 error');
    EC_spec.User.Follow.deleteFollowing('test', following => {
      expect(following).not.toContain('test');
      done();
    });
  });

  describe('Followers  [require premium user]', () =>{
    if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    );

    it('get followers', done => {
      EC_spec.User.Follow.getFollowers(followers => {
        expect(followers).toEqual(jasmine.any(Array));
        done();
      });
    });
  });
});
