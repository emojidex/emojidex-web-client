/* eslint-disable no-undef */
describe('EmojidexUserHistory', () => {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('get', done =>
    ECSpec.User.History.get(history => {
      expect(history.length).toBeTruthy()
      expect(history[0].code).toBeTruthy()
      expect(history[0].times_used).toBeTruthy()
      done()
    })
  )

  it('get (history info only)', done =>
    ECSpec.User.History.getHistoryInfoOnly(history => {
      expect(history.length).toBeTruthy()
      expect(history[0].code).toBeFalsy()
      expect(history[0].times_used).toBeTruthy()
      done()
    })
  )
  
  // NOTE: 現在のemojidex.comのAPIで、setはできているけどレスポンスが返ってこない状態
  // it('set', done => {
  //   ECSpec.User.History.set('heart').then(response => {
  //     expect(response.emoji_code).toEqual('heart')
  //     done()
  //   })
  // })

  it('all', done => {
    setTimeout(() => { // History.sync()が終わっていない時があるので
      ECSpec.User.History.all(history => {
        expect(history.length).toBeTruthy()
        done()
      })
    }, 2000)
  })

  describe('History pages [require premium user]', () => {
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

    if (hasPremiumAccount()) {
      it('next/prev', done => {
        setTimeout(() => { // History.sync()が終わっていない時があるので
          ECSpec.User.History.next(() => {
            expect(ECSpec.User.History.curPage).toEqual(2)
            ECSpec.User.History.prev(() => {
              expect(ECSpec.User.History.curPage).toEqual(1)
              done()
            })
          })
        }, 2000)
      })
    }
  })
})
/* eslint-enable no-undef */
