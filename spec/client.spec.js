/* eslint-disable no-undef */
describe('EmojidexClient', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('has the EmojidexClient class defined', () => {
    expect(ECSpec).toBeDefined()
  })
})
/* eslint-enable no-undef */
