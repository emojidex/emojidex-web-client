/* eslint-disable no-undef */
describe('EmojidexUtil', () => {
  beforeEach(async done => {
    await helperChains([clearStorage, helperBefore])
    done()
  })

  it('escapes a term with escapeTerm', () => {
    expect(ECSpec.Util.escapeTerm('emoji kiss(p)')).toBe('emoji_kiss(p)')
    expect(ECSpec.Util.escapeTerm('うんち　テスト (p)')).toBe('うんち_テスト_(p)')
  })

  it('de-escapes a term with deEscapeTerm', () => {
    expect(ECSpec.Util.deEscapeTerm('emoji_kiss(p)')).toBe('emoji kiss(p)')
    expect(ECSpec.Util.deEscapeTerm('うんち_テスト_(p)')).toBe('うんち テスト (p)')
  })

  it('encapsulates a code with colons', () => {
    expect(ECSpec.Util.encapsulateCode('my code')).toBe(':my code:')
    expect(ECSpec.Util.encapsulateCode(':my code:')).toBe(':my code:')
  })

  it('un-encapsulates a code with colons', () => {
    expect(ECSpec.Util.unEncapsulateCode(':my code:')).toBe('my code')
  })

  it('simplifies an emoji object array for easy processing with simplify', () => {
    const emoji = ECSpec.Util.simplify([emojiKissing])
    expect(emoji[0].code).toBe('kissing')
    expect(emoji[0].imgUrl).toBe(`${ECSpec.cdnUrl}/${ECSpec.sizeCode}/${emoji[0].code}.png`)
  })

  it('converts an emoji object into an HTML tag set', async done => {
    const emoji = await ECSpec.Search.find('red_car')
    expect(ECSpec.Util.emojiToHTML(emoji)).toBe(
      '<img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" />')
    done()
  })

  it('converts an emoji object into an HTML tag set with link', async done => {
    const emoji = await ECSpec.Search.find('emojidex')
    expect(ECSpec.Util.emojiToHTML(emoji)).toBe(
      '<a href="https://www.emojidex.com" emoji-code="emojidex"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/emojidex.png" emoji-code="emojidex" alt="emojidex" /></a>')
    done()
  })

  it('converts an emoji object into a Markdown snippet', async done => {
    const emoji = await ECSpec.Search.find('red_car')
    expect(ECSpec.Util.emojiToMD(emoji)).toBe(
      '![🚗](https://cdn.emojidex.com/emoji/xhdpi/red_car.png "red car")')
    done()
  })

  it('converts an emoji object into a Markdown snippet with link', async done => {
    const emoji = await ECSpec.Search.find('emojidex')
    expect(ECSpec.Util.emojiToMD(emoji)).toBe(
      '[![emojidex](https://cdn.emojidex.com/emoji/xhdpi/emojidex.png "emojidex") ](https://www.emojidex.com)')
    done()
  })

  it('converts text with emoji html in it to plain text with emoji short codes', () => {
    testText = 'Test text <img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" ' +
      'emoji-code="red_car" emoji-moji="🚗" alt="red car" />テスト<a href="https://www.emojidex.com" ' +
      'emoji-code="emojidex"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/emojidex.png" ' +
      'emoji-code="emojidex" alt="emojidex" /></a><img src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" />'

    expectedText = 'Test text 🚗テスト:emojidex:<img src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" />'

    expect(ECSpec.Util.deEmojifyHTML(testText)).toBe(expectedText)
  })

  it('converts text with emoji html in it to plain text with emoji short codes, accounting for span wraps', () => {
    testText = 'Test text <span><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" ' +
      'emoji-code="red_car" emoji-moji="🚗" alt="red car" /></span>テスト<span class=".atwho-inserted"/><a href="https://www.emojidex.com" ' +
      'emoji-code="emojidex"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/emojidex.png" ' +
      'emoji-code="emojidex" alt="emojidex" /></a></span><span></span><img src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" />'

    expectedText = 'Test text 🚗テスト:emojidex:<img src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" />'

    expect(ECSpec.Util.deEmojifyHTML(testText)).toBe(expectedText)
  })

  it('converts text with emoji html in it to plain text with emoji short codes (assuming quotes were reversed)', () => {
    testText2 = 'Test text <img class=\'emojidex-emoji\' src=\'https://cdn.emojidex.com/emoji/xhdpi/red_car.png\' ' +
      'emoji-code=\'red_car\' emoji-moji=\'🚗\' alt=\'red car\' />テスト<a href=\'https://www.emojidex.com\' ' +
      'emoji-code=\'emojidex\'><img class=\'emojidex-emoji\' src=\'https://cdn.emojidex.com/emoji/xhdpi/emojidex.png\' ' +
      'emoji-code=\'emojidex\' alt=\'emojidex\' /></a><img src=\'https://cdn.emojidex.com/emoji/xhdpi/red_car.png\' />'

    expectedText = 'Test text 🚗テスト:emojidex:<img src=\'https://cdn.emojidex.com/emoji/xhdpi/red_car.png\' />'

    expect(ECSpec.Util.deEmojifyHTML(testText2)).toBe(expectedText)
  })

  it('finds emoji character codes in text and converts them with the chosen drop-in converter', async done => {
    testText = 'I have a 🚗🚗. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.'

    expectedText = 'I have a *moji=🚗*red car===3*moji=🚗*red car===3. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.'

    const processedText = await ECSpec.Util.emojifyMoji(testText, emoji => {
      return '*moji=🚗*' + emoji.code + '===3'
    })
    expect(processedText).toBe(expectedText)
    done()
  })

  it('finds short codes in text and converts them with the chosen drop-in converter', async done => {
    testText = 'I have a 🚗. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.' +
      ':two hearts::lemon::cupcake::椛::hamburger::86 taillight(left)::幻::幻(白)::bat:'

    expectedText = 'I have a 🚗. My favorite sushi is *(サーモン)すし*. :-) :::xxxxxxxx:.' +
      '*two hearts**lemon**cupcake**椛**hamburger**86 taillight(left)**幻**幻(白)**bat*'

    const processedText = await ECSpec.Util.emojifyCodes(testText, emoji => {
      return '*' + emoji.code + '*'
    })
    expect(processedText).toBe(expectedText)
    done()
  })

  it('converts plain text with emoji characters and short codes into text with emoji HTML tags', async done => {
    testText = 'Test text 🚗テスト:emojidex:'

    expectedText = 'Test text <img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" ' +
      'emoji-code="red_car" emoji-moji="🚗" alt="red car" />テスト<a href="https://www.emojidex.com" ' +
      'emoji-code="emojidex"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/emojidex.png" ' +
      'emoji-code="emojidex" alt="emojidex" /></a>'

    const processed = await ECSpec.Util.emojifyToHTML(testText)
    expect(processed).toBe(expectedText)
    done()
  })

  it('finds emoji text with only emoji characters and converts them with the chosen drop-in converter', async done => {
    testText = 'I have a 🚗. :-) :::xxxxxxxx:.'

    expectedText = 'I have a *red car*. :-) :::xxxxxxxx:.'

    const processedText = await ECSpec.Util.emojify(testText, emoji => {
      return '*' + emoji.code + '*'
    })
    expect(processedText).toBe(expectedText)
    done()
  })

  it('finds short codes in text with only short codes and converts them with the chosen drop-in converter', async done => {
    testText = 'My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.'

    expectedText = 'My favorite sushi is *(サーモン)すし*. :-) :::xxxxxxxx:.'

    const processedText = await ECSpec.Util.emojify(testText, emoji => {
      return '*' + emoji.code + '*'
    })
    expect(processedText).toBe(expectedText)
    done()
  })

  it('finds emoji and short codes in text and converts them with the chosen drop-in converter', async done => {
    testText = 'I have a 🚗. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.'

    expectedText = 'I have a *red car*. My favorite sushi is *(サーモン)すし*. :-) :::xxxxxxxx:.'

    const processedText = await ECSpec.Util.emojify(testText, emoji => {
      return '*' + emoji.code + '*'
    })
    expect(processedText).toBe(expectedText)
    done()
  })

  it('replace utf emoji & ZWJ emoji & plain text to html tag', async done => {
    testText = '🚗🚗aaa👨‍👩‍👦👨‍👩‍👧bbb🚗ccc👨🏻‍👨🏿‍👦🏼ddd👨‍👶‍👧eee'

    expectedText = '<img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" />aaa<span class="zwj-emoji"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/0/man.png" emoji-code="man" emoji-moji="👨" alt="man" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/1/woman.png" emoji-code="woman" emoji-moji="👩" alt="woman" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/2/boy.png" emoji-code="boy" emoji-moji="👦" alt="boy" /></span><span class="zwj-emoji"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/0/man.png" emoji-code="man" emoji-moji="👨" alt="man" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/1/woman.png" emoji-code="woman" emoji-moji="👩" alt="woman" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/2/girl.png" emoji-code="girl" emoji-moji="👧" alt="girl" /></span>bbb<img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" />ccc<span class="zwj-emoji"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/0/man(wh).png" emoji-code="man(wh)" emoji-moji="👨🏻" alt="man(wh)" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/1/man(bk).png" emoji-code="man(bk)" emoji-moji="👨🏿" alt="man(bk)" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/2/boy(p).png" emoji-code="boy(p)" emoji-moji="👦🏼" alt="boy(p)" /></span>ddd<span class="zwj-emoji"><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/0/man.png" emoji-code="man" emoji-moji="👨" alt="man" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/2/girl.png" emoji-code="girl" emoji-moji="👧" alt="girl" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/family/4/baby.png" emoji-code="baby" emoji-moji="👶" alt="baby" /></span>eee'

    const processed = await ECSpec.Util.emojifyToHTML(testText)
    expect(processed).toBe(expectedText)
    done()
  })

  it('if incorrect ZWJ combination, without sorting and do not output ZWJ span tag', async done => {
    testText = '👨‍👶‍👶‍👶‍👶‍👨'

    expectedText = '<img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/man.png" emoji-code="man" emoji-moji="👨" alt="man" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/baby.png" emoji-code="baby" emoji-moji="👶" alt="baby" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/baby.png" emoji-code="baby" emoji-moji="👶" alt="baby" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/baby.png" emoji-code="baby" emoji-moji="👶" alt="baby" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/baby.png" emoji-code="baby" emoji-moji="👶" alt="baby" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/man.png" emoji-code="man" emoji-moji="👨" alt="man" />'

    const processed = await ECSpec.Util.emojifyToHTML(testText)
    expect(processed).toBe(expectedText)
    done()
  })

  it('if not combination emoji with ZWJ, remove ZWJ', async done => {
    testText = '🚗‍🚗'
    expectedText = '<img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" /><img class="emojidex-emoji" src="https://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" />'

    const processed = await ECSpec.Util.emojifyToHTML(testText)
    expect(processed).toBe(expectedText)
    done()
  })

  it('replace utf emoji to 3D', async done => {
    testText = '💩aaa:poop:bbb'

    const processed = await ECSpec.Util.emojifyToThreed(testText)
    expect(processed).toContain('canvas')
    done()
  })
})
/* eslint-enable no-undef */
