/* eslint-disable no-undef */
describe('EmojidexCustomizations', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  )

  it('get', done =>
    ECSpec.Customizations.get(customizationEmojis => {
      expect(customizationEmojis.length).toBeTruthy()
      const result = customizationEmojis.every(emoji => {
        return emoji.customizations.length
      })
      expect(result).toBeTruthy()
      done()
    })
  )

  describe('Customizations pages', () => {
    beforeAll(done => {
      ECSpec.limit = 1
      ECSpec.Customizations.get(() => done())
    })

    it('next/prev', done => {
      ECSpec.Customizations.customized.callback = () => {
        expect(ECSpec.Customizations.curPage).toEqual(2)

        ECSpec.Customizations.customized.callback = () => {
          expect(ECSpec.Customizations.curPage).toEqual(1)
          done()
        }

        ECSpec.Customizations.prev()
      }

      ECSpec.Customizations.next()
    })
  })
})
/* eslint-enable no-undef */
