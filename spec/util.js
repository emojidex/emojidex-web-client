describe('EmojidexUtil', function() {
  beforeEach(function(done) {
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    });
  });

  it('escapes a term with escapeTerm', function() {
    expect(EC_spec.Util.escapeTerm('emoji kiss(p)')).toBe('emoji_kiss(p)');
    expect(EC_spec.Util.escapeTerm('うんち　テスト (p)')).toBe('うんち_テスト_(p)');
  });

  it('de-escapes a term with deEscapeTerm', function() {
    expect(EC_spec.Util.deEscapeTerm('emoji_kiss(p)')).toBe('emoji kiss(p)');
    expect(EC_spec.Util.deEscapeTerm('うんち_テスト_(p)')).toBe('うんち テスト (p)');
  });

  it('encapsulates a code with colons', function() {
    expect(EC_spec.Util.encapsulateCode('my code')).toBe(':my code:');
    expect(EC_spec.Util.encapsulateCode(':my code:')).toBe(':my code:');
  });

  it('un-encapsulates a code with colons', function() {
    expect(EC_spec.Util.unEncapsulateCode(':my code:')).toBe('my code');
  });

  it('simplifies an emoji object array for easy processing with simplify', function() {
    let emoji = EC_spec.Util.simplify([emoji_kissing]);
    expect(emoji[0].code).toBe('kissing');
    expect(emoji[0].img_url).toBe(`${EC_spec.cdn_url}/${EC_spec.size_code}/${emoji[0].code}.png`);
  });

  it('converts an emoji object into an HTML tag set', done =>
    EC_spec.Search.find('red_car', function(emoji) {
      expect(EC_spec.Util.emojiToHTML(emoji)).toBe(
        '<img class="emojidex-emoji" src="http://cdn.emojidex.com/emoji/xhdpi/red_car.png" emoji-code="red_car" emoji-moji="🚗" alt="red car" />');
      done();
    })
  );

  it('converts an emoji object into an HTML tag set with link', done =>
    EC_spec.Search.find('emojidex', function(emoji) {
      expect(EC_spec.Util.emojiToHTML(emoji)).toBe(
        '<a href="https://www.emojidex.com" emoji-code="emojidex"><img class="emojidex-emoji" src="http://cdn.emojidex.com/emoji/xhdpi/emojidex.png" emoji-code="emojidex" alt="emojidex" /></a>');
      done();
    })
  );


  it('converts an emoji object into a Markdown snippet', done =>
    EC_spec.Search.find('red_car', function(emoji) {
      expect(EC_spec.Util.emojiToMD(emoji)).toBe(
        '![🚗](http://cdn.emojidex.com/emoji/xhdpi/red_car.png "red car")');
      done();
    })
  );

  it('converts an emoji object into a Markdown snippet with link', done =>
    EC_spec.Search.find('emojidex', function(emoji) {
      expect(EC_spec.Util.emojiToMD(emoji)).toBe(
        '[![emojidex](http://cdn.emojidex.com/emoji/xhdpi/emojidex.png "emojidex") ](https://www.emojidex.com)');
      done();
    })
  );

  it('converts text with emoji html in it to plain text with emoji short codes', function() {
    test_text = 'Test text <img class="emojidex-emoji" src="http://cdn.emojidex.com/emoji/xhdpi/red_car.png" '
      + 'emoji-code="red_car" emoji-moji="🚗" alt="red car" />テスト<a href="https://www.emojidex.com" '
      + 'emoji-code="emojidex"><img class="emojidex-emoji" src="http://cdn.emojidex.com/emoji/xhdpi/emojidex.png" '
      + 'emoji-code="emojidex" alt="emojidex" /></a><img src="http://cdn.emojidex.com/emoji/xhdpi/red_car.png" />';

    expected_text =  'Test text 🚗テスト:emojidex:<img src="http://cdn.emojidex.com/emoji/xhdpi/red_car.png" />';

    expect(EC_spec.Util.deEmojifyHTML(test_text)).toBe(expected_text);
  });

  it('converts text with emoji html in it to plain text with emoji short codes (assuming quotes were reversed)', function() {
    test_text2 =  "Test text <img class='emojidex-emoji' src='http://cdn.emojidex.com/emoji/xhdpi/red_car.png' "
      + "emoji-code='red_car' emoji-moji='🚗' alt='red car' />テスト<a href='https://www.emojidex.com' "
      + "emoji-code='emojidex'><img class='emojidex-emoji' src='http://cdn.emojidex.com/emoji/xhdpi/emojidex.png' "
      + "emoji-code='emojidex' alt='emojidex' /></a><img src='http://cdn.emojidex.com/emoji/xhdpi/red_car.png' />';

    expected_text = "Test text 🚗テスト:emojidex:<img src='http://cdn.emojidex.com/emoji/xhdpi/red_car.png' />";

    expect(EC_spec.Util.deEmojifyHTML(test_text2)).toBe(expected_text);
  });

  it('finds emoji character codes in text and converts them with the chosen drop-in converter', function(done) {
    test_text = 'I have a 🚗🚗. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.';

    expected_text = 'I have a *moji=🚗*red car===3*moji=🚗*red car===3. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.';

    EC_spec.Util.emojifyMoji(test_text, function(emoji) {
      return '*moji=🚗*' + emoji.code + '===3';
    }).then((processed_text) => {
      expect(processed_text).toBe(expected_text);
      done();
    });
  });

  it('finds short codes in text and converts them with the chosen drop-in converter', function(done) {
    test_text = 'I have a 🚗. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.' +
      ":two hearts::lemon::cupcake::椛::hamburger::86 taillight(left)::幻::幻(白)::bat:";

    expected_text = 'I have a 🚗. My favorite sushi is *(サーモン)すし*. :-) :::xxxxxxxx:.' +
      "*two hearts**lemon**cupcake**椛**hamburger**86 taillight(left)**幻**幻(白)**bat*";

    EC_spec.Util.emojifyCodes(test_text, function(emoji) {
      return '*' + emoji.code + '*';
    }).then((processed_text) => {
      expect(processed_text).toBe(expected_text);
      done();
    });
  });

  it('converts plain text with emoji characters and short codes into text with emoji HTML tags', function(done) {
    test_text = "Test text 🚗テスト:emojidex:";

    expected_text = 'Test text <img class="emojidex-emoji" src="http://cdn.emojidex.com/emoji/xhdpi/red_car.png" '
      + 'emoji-code="red_car" emoji-moji="🚗" alt="red car" />テスト<a href="https://www.emojidex.com" '
      + 'emoji-code="emojidex"><img class="emojidex-emoji" src="http://cdn.emojidex.com/emoji/xhdpi/emojidex.png" '
      + 'emoji-code="emojidex" alt="emojidex" /></a>';

    EC_spec.Util.emojifyToHTML(test_text).then((processed) => {
      expect(processed).toBe(expected_text);
      done();
    });
  });

  it('finds emoji text with only emoji characters and converts them with the chosen drop-in converter', function(done) {
    test_text = 'I have a 🚗. :-) :::xxxxxxxx:.';

    expected_text = 'I have a *red car*. :-) :::xxxxxxxx:.';

    EC_spec.Util.emojify(test_text, function(emoji) {
      return '*' + emoji.code + '*';
    }).then((processed_text) => {
      expect(processed_text).toBe(expected_text);
      done();
    });
  });

  it('finds short codes in text with only short codes and converts them with the chosen drop-in converter', function(done) {
    test_text = 'My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.';

    expected_text = 'My favorite sushi is *(サーモン)すし*. :-) :::xxxxxxxx:.';

    EC_spec.Util.emojify(test_text, function(emoji) {
      return '*' + emoji.code + '*';
    }).then((processed_text) => {
      expect(processed_text).toBe(expected_text);
      done();
    });
  });

  it('finds emoji and short codes in text and converts them with the chosen drop-in converter', function(done) {
    test_text = 'I have a 🚗. My favorite sushi is :(サーモン)すし:. :-) :::xxxxxxxx:.';

    expected_text = 'I have a *red car*. My favorite sushi is *(サーモン)すし*. :-) :::xxxxxxxx:.';

    EC_spec.Util.emojify(test_text, function(emoji) {
      return '*' + emoji.code + '*';
    }).then((processed_text) => {
      expect(processed_text).toBe(expected_text);
      done();
    });
  });
});
