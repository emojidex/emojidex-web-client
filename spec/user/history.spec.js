describe('EmojidexUserHistory', function() {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('get', done =>
    EC_spec.User.History.get(history => {
      expect(history.length).toBeTruthy();
      expect(history[0].code).toBeTruthy();
      expect(history[0].times_used).toBeTruthy();
      done();
    })
  );

  it('get (history info only)', done =>
    EC_spec.User.History.getHistoryInfoOnly(history => {
      expect(history.length).toBeTruthy();
      expect(history[0].code).toBeFalsy();
      expect(history[0].times_used).toBeTruthy();
      done();
    })
  );

  it('all', done => {
    setTimeout(() => {  // History.sync()が終わっていない時があるので
      EC_spec.User.History.all(history => {
        expect(history.length).toBeTruthy();
        done();
      })
    }, 2000);
  });

  describe('History pages [require premium user]', function() {
    if (typeof premium_user_info === 'undefined' || premium_user_info === null) { pending(); }
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    );

    it('next/prev', done => {
      EC_spec.limit = 5;
      setTimeout(() => {  // History.sync()が終わっていない時があるので
        EC_spec.User.History.next(history => {
          expect(EC_spec.User.History.cur_page).toEqual(2);
          EC_spec.User.History.prev(history => {
            expect(EC_spec.User.History.cur_page).toEqual(1);
            done();
          });
        });
      }, 2000);
    });
  });
});
