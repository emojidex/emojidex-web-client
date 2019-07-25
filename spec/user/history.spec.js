/* eslint-disable no-undef */
describe('EmojidexUserHistory', () => {
  beforeEach(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('get', async done => {
    const history = await ECSpec.User.History.get()
    expect(history.length).toBeTruthy()
    expect(history[0].code).toBeTruthy()
    expect(history[0].times_used).toBeTruthy()
    done()
  })

  it('get (history info only)', async done => {
    const history = await ECSpec.User.History.getHistoryInfoOnly()
    expect(history.length).toBeTruthy()
    expect(history[0].code).toBeFalsy()
    expect(history[0].times_used).toBeTruthy()
    done()
  })

  // NOTE: 現在のemojidex.comのAPIで、setはできているけどレスポンスが返ってこない状態
  xit('set', async done => {
    const response = await ECSpec.User.History.set('heart')
    expect(response.emoji_code).toEqual('heart')
    done()
  })

  it('all', async done => {
    await specTimer(2000) // History.sync()が終わっていない時があるので
    const history = await ECSpec.User.History.all()
    expect(history.length).toBeTruthy()
    done()
  })

  describe('History pages [require premium user]', () => {
    beforeEach(done =>
      helperChains({
        functions: [clearStorage, helperBeforeForPremiumUser],
        end: done
      })
    )

    if (hasPremiumAccount()) {
      it('next/prev', async done => {
        await specTimer(2000) // History.sync()が終わっていない時があるので
        await ECSpec.User.History.next()
        expect(ECSpec.User.History.curPage).toEqual(2)
        await ECSpec.User.History.prev()
        expect(ECSpec.User.History.curPage).toEqual(1)
        done()
      })
    }
  })
})
/* eslint-enable no-undef */
