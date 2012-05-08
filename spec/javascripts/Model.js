// Generated by CoffeeScript 1.3.1

(function() {
  var flatten;
  flatten = function(obj) {
    return JSON.encode(obj);
  };
  return describe("Model test", function() {
    var m;
    m = null;
    beforeEach(function() {
      return m = new Model();
    });
    it('gets/sets attributes', function() {
      expect(m.has('test')).toBe(false);
      expect(m.get('test')).toBe(void 0);
      m.set('test', 'internet');
      expect(m.has('test')).toBe(true);
      return expect(m.get('test')).toBe('internet');
    });
    it('sets multiple attributes', function() {
      m.setMany({
        test: 'internet2',
        more: 'fecker'
      });
      expect(m.get('test')).toBe('internet2');
      return expect(m.get('more')).toBe('fecker');
    });
    it('fires change event on attr change', function() {
      var changed, changedAKey;
      changed = {};
      m.addEvent('change', function(key, value) {
        return changed[key] = value;
      });
      changedAKey = null;
      m.addEvent('change:aKey', function(value) {
        return changedAKey = value;
      });
      m.setMany({
        aKey: 'internet',
        bKey: 'test'
      });
      expect(changed.aKey).toBe('internet');
      expect(changedAKey).toBe('internet');
      return expect(changed.bKey).toBe('test');
    });
    it('sets defaults silently when initializing model', function() {
      var changeFired;
      Model.implement({
        _defaults: {
          type: 'text',
          internet: 2,
          override: 'feck'
        }
      });
      changeFired = false;
      m = new Model({
        override: 'arse'
      }, {
        onChange: function() {
          console.log(arguments);
          return changeFired = true;
        }
      });
      expect(m.get('type')).toBe('text');
      expect(m.get('internet')).toBe(2);
      expect(m.get('override')).toBe('arse');
      expect(changeFired).toBe(false);
      Model.implement({
        _defaults: null
      });
      return Model.implement({
        _defaults: {}
      });
    });
    it('inits types correctly', function() {
      Model.implement({
        _types: {
          aDate: 'Date',
          aModel: 'Model'
        }
      });
      m = new Model({
        aDate: '2012/01/01 02:02',
        aModel: {
          feck: 'arse'
        }
      });
      expect(instanceOf(m.get('aDate'), Date)).toBe(true);
      expect(m.get('aDate').format('%Y/%m/%d %H:%M')).toBe('2012/01/01 02:02');
      expect(instanceOf(m.get('aModel'), Model)).toBe(true);
      expect(m.get('aModel').get('feck')).toBe('arse');
      Model.implement({
        _types: null
      });
      return Model.implement({
        _types: {}
      });
    });
    return it('inits type within arrays correctly', function() {
      Model.implement({
        _types: {
          aDate: 'Date'
        }
      });
      m = new Model({
        aDate: ['2012/01/01 02:02', '2012/01/01 02:03']
      });
      expect(m.get('aDate')[0].format('%Y/%m/%d %H:%M')).toBe('2012/01/01 02:02');
      expect(m.get('aDate')[1].format('%Y/%m/%d %H:%M')).toBe('2012/01/01 02:03');
      Model.implement({
        _types: null
      });
      return Model.implement({
        _types: {}
      });
    });
  });
})();
