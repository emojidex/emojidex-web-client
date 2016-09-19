describe('EmojidexClient', function() {
  beforeAll(done =>
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('has the EmojidexClient class defined', () => expect(EC_spec).toBeDefined()
  );
});
