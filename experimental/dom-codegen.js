var utility = require('continuum').utility,
    each = utility.each,
    map = utility.map,
    ownKeys = utility.keys,
    Hash = utility.Hash,
    astify = require('astify'),
    $ = astify.createNode,
    ASTNode = astify.ASTNode,
    ASTArray = astify.ASTArray;



var json = {};

each(['typedarray'], function(name){
  each(require('./'+name), function(value, key){
    json[key] = value;
  });
});



var DICT = $('#ident', 'dict'),
    TARGET = $('#ident', 'target'),
    THIS = $('#this'),
    WRAPPED = THIS.get($('#at', 'wrapped')),
    _get = $('#ident', 'GET'),
    _set = $('#ident', 'SET'),
    _call = $('#ident', 'CALL'),
    _wrap = $('#ident', 'WRAP'),
    _unwrap = $('#ident', 'UNWRAP'),
    _wrapOrNull = $('#ident', 'WRAP_OR_NULL'),
    _unwrapOrNull = $('#ident', 'UNWRAP_OR_NULL'),
    ZERO = VALUE(0),
    EMPTY = VALUE(''),
    MAX_INT16 = VALUE(65536);


// Uint8
// Uint16
// Uint32
// Uint64
// Int8
// Int16
// Int32
// Int64
// Float32
// Float32
// Float32
// Float64
// Float64
// String
// Boolean
// Object
// Void
// Any
// Window

function TO_NUMBER(node){
  return $('#unary', '+', node);
}

function NEGATE(node){
  return $('#unary', '-', node);
}

function NOT(node){
  return $('#unary', '!', node);
}

function BITWISE_NOT(node){
  return $('#unary', '~', node);
}

function BIT_AND(left, right){
  return $('#binary', '&', left, right);
}

function converter(name){
  return function(node){
    return $('#call', name, [node]);
  };
}

function passthrough(setter){
  return { wrap: function(node){ return node },
           unwrap: setter };
}

var TO = {
  String: passthrough(function(node){
    return $('#binary', '+', EMPTY, node);
  }),
  Uint64: {
    unwrap: function(node){
      return $('#binary', '>>>', node, ZERO);
    },
    wrap: converter('toUint64')
  },
  Int64: {
    unwrap: function(node){
      return $('#binary', '>>', node, ZERO);
    },
    wrap: converter('toInt64')
  },
  Uint32: passthrough(function(node){
    return $('#binary', '>>>', node, ZERO);
  }),
  Int32: passthrough(function(node){
    return $('#binary', '>>', node, ZERO);
  }),
  Uint16: passthrough(converter('toInt16')),
  Int16: passthrough(converter('toInt16')),
  Uint8: passthrough(converter('toInt8')),
  Int8: passthrough(converter('toInt8')),
  Float32: passthrough(function(node){
    return $('#logical', '||', $('#unary', '+', node), ZERO);
  }),
  Float64: passthrough(function(node){
    return $('#logical', '||', $('#unary', '+', node), ZERO);
  }),
  Boolean: passthrough(function(node){
    return NOT(NOT(node));
  }),
  EventHandler: {
    wrap: wrap,
    unwrap: function(node){
      return $('#call', $('#ident', 'CALLBACK_OR_NULL'), [node]);
    }
  },
  EventHandlerNonNull: {
    wrap: wrap,
    unwrap: function(node){
      return $('#call', $('#ident', 'CALLBACK'), [node]);
    }
  }
};


function ensure(node, type, callback){
  if (typeof node === 'string') {
    node = IDENT(node);
  }
  if (type in TO) {
    return TO[type][callback.name](node);
  }
  if (/Callback$/.test(type)) {
    return TO.EventHandlerNonNull[callback.name](node);
  }
  if (type in ordered) {
    return callback(node, type);
  }
  if (type instanceof Array) {
    type = $('#array', type);
  } else {
    type = $(type.replace('...', ''));
  }
  return callback(node, type);
}

function wrap(node){
  return $('#call', _wrap, node);
}

function unwrap(node){
  return $('#call', _unwrap, node);
}



function IN(left, right){
  return $('#binary', 'in', left, right);
}

function OR(left, right){
  return $('#logical', '||', left, right);
}

function METHOD(name, type, body, args){
  if (type === 'get') {
    args = [];
  } else if (type === 'set') {
    args = args ? args : ['v'];
  } else if (!args) {
    args = [];
  }
  if (!body) {
    body = [];
  } else if (!(body instanceof Array)) {
    body = [body];
  }
  return $('#method', name, $('#functionexpr', name, args, body), type);
}



function GETTER(name, json){
  return METHOD(name, 'get', [$('#return', ensure($('#call', _get, [WRAPPED, name]), json, wrap))])
}

function SETTER(name, json){
  return METHOD(name, 'set', [$('#call', _set, [WRAPPED, name, ensure(IDENT('v'), json, unwrap)])]);
}

function VALUE(val){
  if (val && typeof val === 'object') {
    return $('#object');
  } else {
    return $('#literal', val);
  }
}

function IDENT(v){
  return $('#ident', v);
}

function TERNARY(test, consequent, alternate){
  return $('#conditional', test, consequent, alternate);
}

function TYPEOF(test, equals, consequent, alternate){
  test = $('#binary', '===', $('#unary', 'typeof', test), VALUE(equals));
  return TERNARY(test, consequent, alternate);
}

function INSTANCEOF(test, equals, consequent, alternate){
  test = $('#binary', 'instanceof', test, equals);
  return TERNARY(test, consequent, alternate);
}




function method(name, json, construct){
  var params = ownKeys(Object(json.args));
  if (params.length && json.args[params[params.length - 1]].slice(-3) === '...') {
    var rest = params.pop();
  }

  var body = new ASTArray;
  var args = construct ? [IDENT(construct)] : [WRAPPED, name];

  each(params, function(param){
    var type = json.args[param];
    if (ordered[type] && ordered[type].type === 'dictionary') {
      args.push($('#new', $(type), [IDENT(param)]));
    } else {
      args.push(ensure(param, type, unwrap));
    }
  });

  var call = construct ? $('#assign', '=', WRAPPED, $('#call', IDENT('CONSTRUCT'), args)) : $('#call', _call, args);

  if (json.returns) {
    body.append($('#return', ensure(call, json.returns, wrap)));
  } else {
    body.append(call);
  }
  return $('#method', name, $('#functionexpr', name, params, body, rest));
}


var types = {
  exception: function(name, json){
    return types.interface(name, json);
  },
  //callback: function(name, json){},
  enum: function(name, json){
    var values = $('#object');
    each(json.values, function(item, i){
      values.set(item, item);
    });
    var decl = $('#var', 'const');
    decl.declare(name, values);
    return decl;
  },
  interface: function(name, json){
    if (json.construct && json.construct.name) {
      var ret = $('#var', 'var');
          iface = $('#classexpr', json.construct.name, null, json.inherits[0]),
          body = iface.body;
      ret.declare(name, iface);
    } else {
      var ret = $('#class', name, null, json.inherits[0]),
          body = ret.body;
    }


    if (json.construct) {
      body.append(method('constructor', json.construct, name));
    }

    each(json.properties, function(item, key){
      body.append(GETTER(key, item));
      body.append(SETTER(key, item));
    });

    each(json.readonly, function(item, key){
      body.append(GETTER(key, item));
    });

    each(json.methods, function(item, key){
      body.append(method(key, item));
    });

    return $('#export', ret);
  },
  dictionary: function(name, json){
    var inherits = json.inherits[0],
        dict = $('#class', name, null, inherits),
        ctor = $('#method', 'constructor', $('#functionexpr', null, [DICT])),
        body = ctor.value.body;

    dict.body.append(ctor);
    body.append(DICT.set(OR(DICT, IDENT('EMPTY'))));

    if (inherits) {
      body.append($('super').call(DICT));
    }

    each(json.defaults, function(item, key){
      var init = TERNARY(IN(VALUE(key), DICT), DICT.get(key), VALUE(item));
      body.append(THIS.set(key, init));
    });
    return dict;
  }
};



function orderDependencies(items){
  var out = new Hash,
      remaining = [];

  each(items, function(item, key){
    item.name = key;
    if (!item.inherits || !item.inherits.length || item.inherits[0] in out) {
      out[key] = item;
    } else {
      remaining.push(item);
    }
  });

  do {
    var count = remaining.length;
    remaining = remaining.filter(function(item){
      if (!item.inherits || item.inherits[0] in out) {
        out[item.name] = item;
        return false;
      }
      return true;
    });
  } while (count && count !== remaining.length)

  return out;
}



var out = $('#module', 'DOM', []);

var ordered = orderDependencies(json);

each(ordered, function(item, name){
  if (item.type in types) {
    out.append(types[item.type](name, item));
    if (item.constants) {
      out.append($('#call', 'constants', [IDENT(name), $('#object', item.constants)]));
    }
  }
});

console.log(out.toSource());
