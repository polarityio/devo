'use strict';

polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  onDetailsOpened() {
    this.get('details.results.object').forEach((object, index) => {
      this._initSource(index);
      Ember.set(object, 'showSource', true);
      Ember.set(object, 'showTable', false);
      Ember.set(object, 'showJson', false);
    });
  },
  actions: {
    showTable: function(index) {
      this.set('details.results.object.' + index + '.showTable', true);
      this.set('details.results.object.' + index + '.showJson', false);
      this.set('details.results.object.' + index + '.showSource', false);
    },
    showJson: function(index) {
      if (typeof this.get('details.results.object.' + index + '.json') === 'undefined') {
        this.set(
          'details.results.object.' + index + '.json',
          this.syntaxHighlight(JSON.stringify(this.get('details.results.object.' + index), null, 4))
        );
      }
      this.set('details.results.object.' + index + '.showTable', false);
      this.set('details.results.object.' + index + '.showJson', true);
      this.set('details.results.object.' + index + '.showSource', false);
    },
    showSource: function(index) {
      this._initSource(index);
      this.set('details.results.object.' + index + '.showTable', false);
      this.set('details.results.object.' + index + '.showJson', false);
      this.set('details.results.object.' + index + '.showSource', true);
    }
  },
  _initSource(index) {
    if (typeof this.get('details.results.object.' + index + '.sourceStringified') === 'undefined') {
      const _source = this.get('details.results.object.' + index);
      const _sourceStringified = {};
      Object.entries(_source).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && Array.isArray(value) === false) {
          _sourceStringified[key] = JSON.stringify(value, null, 0);
        } else {
          _sourceStringified[key] = value;
        }
      });
      this.set('details.results.object.' + index + '.sourceStringified', _sourceStringified);
    }
  },
  syntaxHighlight(json) {
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function(match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }
});
