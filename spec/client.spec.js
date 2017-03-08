describe('EmojidexClient', function() {
  const storage = undefined;
  beforeAll(done =>
    emojidex_client = new EmojidexClient()
  );

  it('has the EmojidexClient class defined', () => expect(EC_spec).toBeDefined()
  );
});
