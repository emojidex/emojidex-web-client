'use strict';

var _emojidexClient = require('../../dist/js/emojidex-client');

var _emojidexClient2 = _interopRequireDefault(_emojidexClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('EmojidexClient', function () {
  var emojidex_client = void 0;
  beforeAll(function (done) {
    emojidex_client = new _emojidexClient2.default({
      storageHubPath: 'https://www.emojidex.com/hub/1.0.0',
      onReady: function onReady(client) {
        done();
      }
    });
    emojidex_client.init();
  });

  it('has the EmojidexClient class defined', function () {
    expect(emojidex_client).toBeDefined();
  });
});