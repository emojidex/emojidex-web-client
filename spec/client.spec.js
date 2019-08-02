/* eslint-disable no-undef */
describe('EmojidexClient', () => {
  beforeAll(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  it('has the EmojidexClient class defined', () => {
    expect(ECSpec).toBeDefined()
  })
})
/* eslint-enable no-undef */
