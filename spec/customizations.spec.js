describe('EmojidexCustomizations', () => {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('get', done =>
    EC_spec.Customizations.get(customization_emojis => {
      expect(customization_emojis.length).toBeTruthy();
      const result = customization_emojis.every((emoji) => {
        return emoji.customizations.length;
      });
      expect(result).toBeTruthy();
      done();
    })
  );

  describe('Customizations pages', () => {
    beforeAll(done => {
      EC_spec.limit = 1;
      EC_spec.Customizations.get(() => done());
    });

    it('next/prev', (done) => {
      EC_spec.Customizations.customized.callback = () => {
        expect(EC_spec.Customizations.cur_page).toEqual(2);

        EC_spec.Customizations.customized.callback = () => {
          expect(EC_spec.Customizations.cur_page).toEqual(1);
          done();
        };
        EC_spec.Customizations.prev();
      };
      EC_spec.Customizations.next();
    });
  });
});
