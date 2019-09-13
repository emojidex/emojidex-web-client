/* eslint-disable no-undef */
describe('EmojidexIndexes', () => {
  beforeAll(async done => {
    await helperChains([clearStorage, helperBefore, getExtendedEmojiData])
    done()
  })

  it('user', async done => {
    const emojiData = await ECSpec.UserEmoji.get('emojidex')
    const codes = emojiEmojidex.map(emoji => emoji.code)
    expect(codes).toContain(emojiData[0].code)
    done()
  })

  it('next', async done => {
    await ECSpec.UserEmoji.next()
    expect(ECSpec.UserEmoji.curPage).toEqual(2)
    done()
  })

  it('prev', async done => {
    await ECSpec.UserEmoji.prev()
    expect(ECSpec.UserEmoji.curPage).toEqual(1)
    done()
  })
})
/* eslint-enable no-undef */
