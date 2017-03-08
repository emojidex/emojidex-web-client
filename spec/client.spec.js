import { CrossStorageClient } from 'cross-storage';

describe('EmojidexClient', function() {
  const storage = undefined;
  beforeAll(done =>
    storage = new CrossStorageClient
    helperChains({
      functions: [clearStorage, helperBefore],
      end: done
    })
  );

  it('has the EmojidexClient class defined', () => expect(EC_spec).toBeDefined()
  );
});
