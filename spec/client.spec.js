// import EmojidexClient from '../../dist/js/emojidex-client';

describe('EmojidexClient', function() {
  let emojidex_client;
  beforeAll(done => {
    emojidex_client = new EmojidexClient({
      storageHubPath: 'https://www.emojidex.com/hub/1.0.0',
      onReady: (client) => {
        done();
      }
    })
    emojidex_client.init();
  });

  it('has the EmojidexClient class defined', () => {
    expect(emojidex_client).toBeDefined()
  });
});
