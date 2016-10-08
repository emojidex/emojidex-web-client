(function() {
  this.EmojidexClient = (function() {
    function EmojidexClient(options) {
      this.env = {
        api_ver: 1,
        cdn_addr: 'cdn.emojidex.com',
        s_cdn_addr: '',
        asset_addr: 'assets.emojidex.com',
        s_asset_addr: ''
      };
      this.defaults = {
        locale: 'en',
        api_url: 'https://www.emojidex.com/api/v1/',
        cdn_url: "http://" + this.env.cdn_addr + "/emoji/",
        closed_net: false,
        min_query_len: 4,
        size_code: 'px32',
        detailed: false,
        limit: 32,
        onReady: (function(_this) {
          return function(arg) {
            return {};
          };
        })(this)
      };
      this.options = $.extend({}, this.defaults, options);
      this.closed_net = this.options.closed_net;
      this.api_url = this.options.api_url;
      this.cdn_url = this.options.cdn_url;
      this.size_code = this.options.size_code;
      this.detailed = this.options.detailed;
      this.limit = this.options.limit;
      this.locale = this.options.locale;
      this.Data = new EmojidexData(this, this.options).then((function(_this) {
        return function(data) {
          _this.User = new EmojidexUser(_this);
          _this.Indexes = new EmojidexIndexes(_this);
          _this.Util = new EmojidexUtil(_this);
          _this.Search = new EmojidexSearch(_this);
          _this.Emoji = new EmojidexEmoji(_this);
          return _this.Categories = new EmojidexCategories(_this);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.options.onReady(_this);
        };
      })(this));
    }

    return EmojidexClient;

  })();

}).call(this);
