var continuum = require('continuum'),
    astify    = require('astify'),
    types     = require('./ast'),
    each      = continuum.utility.each,
    map       = continuum.utility.map,
    ownKeys   = continuum.utility.keys,
    Hash      = continuum.utility.Hash,
    ASTNode   = astify.ASTNode,
    ASTArray  = astify.ASTArray,
    _         = astify.createNode;

var push = [].push;

var _this = _('#this'),
    _define = _('define'),
    _inherit = _('inherit'),
    _replace = _('replace'),
    _el = _this.get('el');


var children = (function(){
  var children = _el.get('children');
  return Array.apply(null, new Array(10)).map(function(_, index){
    return children.get(index);
  });
})();


function PROPERTY(name, type, body, args){
  if (type === 'get') {
    args = [];
  } else if (type === 'set') {
    args = args ? args : ['val'];
  } else if (!args) {
    args = [];
  }
  if (!body) {
    body = [];
  } else if (!(body instanceof Array)) {
    body = [body];
  }
  return _('#property', type, name, _('#functionexpr', name, args, body));
}

function GETTER(details, index){
  return PROPERTY(details.name, 'get', _('#return', children[index].get('ast')));
}

function SETTER(details, param, index, callback){
  param = _(param || 'val');
  callback = callback ? callback.call(param) : param;
  var set = _replace.call([details.name, _el, children[index], callback]);
  return PROPERTY(details.name, 'set', set, [param]);
}

function CONTENT(details, param, index, callback){
  param = _(param || 'val');
  callback = callback ? callback.call(param) : param
  var set = _replace.call([details.name, _el, children[index], callback]);
  return PROPERTY(details.name, 'set', set, [param]);
}

function SETATTR(details, param, callback){
  param = _(param);
  var set = _el.get('setAttribute').call([details.name, callback.call(param)]);
  return PROPERTY(details.name, 'set', set, [param]);
}

function GETATTR(details){
  var get = _el.get('getAttribute').call([details.name]);
  return PROPERTY(details.name, 'get', _('#return', get), []);
}

function LITERAL(value){
  return _('#literal', value);
}

var out = [],
    hash = _('#object');

each(types, function(def, name){
  var args = [],
      methodsNames = [],
      methods = [_('#property', 'init', 'type', name)],
      propTypes = _('#object'),
      enumerations = [],
      kind = def,
      inheritance = [name],
      i = 0;

  var ctorBody = map(def.fields, function(details, name){
    details.name = name;
    args.push(+name === +name ? '$'+name : name);
    methodsNames.push(name);
    if (details.indexed) {
      var types = details.types.length === 1 ? _(details.types[0]) : _('#array', details.types.map(_));
      return _('#return', _('index').call([_this, _(name), name, types]));
    } else {
      return _this.set(name, _('node').get(name));
    }
  });

  methods.push(_('#property', 'init', 'fields', propTypes));

  each(methodsNames, function(arg){
    var field = def.fields[arg];
    if ('values' in field) {
      enumerations.push(_('enumeration').call([_(name), field.name, _('#array', field.values.map(LITERAL))]));
      methods.push(GETATTR(field));
      return methods.push(SETATTR(field, 'setting', _(name).get(field.name)));
    } else if ('content' in field && field.content !== undefined) {
      methods.push(GETTER(field, i));
      return methods.push(SETTER(field, 'content', i++, _(field.content[0])));
    }

    methods.push(GETTER(field, i));
    propTypes.set(field.name, field.types.length === 1 ? _(field.types[0]) : _('#array', field.types));
    if (/[A-Z]/.test(field.types[0][0])) {
      methods.push(SETTER(field, field.list ? 'nodelist' : 'node', i));
    } else {
      methods.push(SETTER(field, 'node', i));
    }
    i++;
  });


  while (kind && kind.kind) {
    inheritance.push(kind.kind);
    kind = types[kind.kind];
  }

  out.push(_('#functiondecl', name, ['node'], [
    _define.call([_this, 'el', _('createElement').call(['span'])]),
    _el.set('className', LITERAL(inheritance.join(' '))),
    _el.set('ast', _this)
  ].concat(ctorBody || [])));

  out.push(_define.call([_(name), 'fields', _('#array', methodsNames.map(LITERAL))]));
  push.apply(out, enumerations);
  out.push(def.kind ? _inherit.call([_(name), _(def.kind), _('#object', methods)])
                    : _define.call([_(name).get('prototype'), _('#object', methods)]));

  hash.set(name, _(name));
});

out.push(_('#var').declare('types', hash));
console.log(_('#program', out).toSource());

