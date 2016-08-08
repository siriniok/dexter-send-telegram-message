const req = require('superagent');
const _   = require('lodash');
const q   = require('q');

module.exports = {
  /**
   * This optional function is called every time before the module executes.  It can be safely removed if not needed.
   *
   */
  init: function() {
  },

  /**
   * The main entry point for the Dexter module
   *
   * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
   * @param {AppData} dexter Container for all data used in this workflow.
   */
  run: function(step, dexter) {
    this.state = {};

    const access_token             = step.input('access_token');

    const chat_id                  = step.input('chat_id');
    const text                     = step.input('text');
    const parse_mode               = step.input('parse_mode');
    const disable_web_page_preview = step.input('disable_web_page_preview');
    const disable_notification     = step.input('disable_notification');
    const reply_to_message_id      = step.input('reply_to_message_id');
    const reply_markup             = step.input('reply_markup');

    const url = `https://api.telegram.org/bot${access_token}/sendMessage`

    const data = {
      chat_id,
      text,
      parse_mode: parse_mode || 'Markdown'
    };

    disable_web_page_preview && (data.disable_web_page_preview =
          disable_web_page_preview)
    disable_notification && (data.disable_notification         =
          disable_notification)
    reply_to_message_id && (data.reply_to_message_id           =
          reply_to_message_id)
    reply_markup && (data.reply_markup                         = reply_markup)

    this.send(url, data)
      .then(this.complete.bind(this))
      .fail(this.fail.bind(this));
  },

  send: function(url, data) {
    const deferred = q.defer();

    req.post(url)
      .type('form')
      .send(data)
      .end((err, result) => {
        const rejected = deferred.reject({
          error: err,
          result: _.get(result,'body')
        });
        const resolved = deferred.resolve(_.extend(data, result.body));

        return err || !_.get(result,'body.ok') ? rejected : resolved;
      });

    return deferred.promise;
  }
};
