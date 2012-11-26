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

each(['dom4', 'html5'], function(name){
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



/*
module DOM {
  export class MutationObserver {
    constructor(callback) {
      this.@wrapped = CONSTRUCT(MutationObserver, CALLBACK(callback));
    }
    observe(target, options) {
      CALL(this.@wrapped, 'observe', UNWRAP(target), new MutationObserverInit(options));
    }
    disconnect() {
      CALL(this.@wrapped, 'disconnect');
    }
    takeRecords() {
      return WRAP(CALL(this.@wrapped, 'takeRecords'));
    }
  }
  class MutationObserverInit {
    constructor(dict) {
      dict = dict || EMPTY;
      this.childList = 'childList' in dict ? dict.childList : false;
      this.attributes = 'attributes' in dict ? dict.attributes : false;
      this.characterData = 'characterData' in dict ? dict.characterData : false;
      this.subtree = 'subtree' in dict ? dict.subtree : false;
      this.attributeOldValue = 'attributeOldValue' in dict ? dict.attributeOldValue : false;
      this.characterDataOldValue = 'characterDataOldValue' in dict ? dict.characterDataOldValue : false;
      this.attributeFilter = 'attributeFilter' in dict ? dict.attributeFilter : {};
    }
  }
  export class MutationRecord {
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get target() {
      return WRAP(GET(this.@wrapped, 'target'));
    }
    get addedNodes() {
      return WRAP(GET(this.@wrapped, 'addedNodes'));
    }
    get removedNodes() {
      return WRAP(GET(this.@wrapped, 'removedNodes'));
    }
    get previousSibling() {
      return WRAP(GET(this.@wrapped, 'previousSibling'));
    }
    get nextSibling() {
      return WRAP(GET(this.@wrapped, 'nextSibling'));
    }
    get attributeName() {
      return GET(this.@wrapped, 'attributeName');
    }
    get attributeNamespace() {
      return GET(this.@wrapped, 'attributeNamespace');
    }
    get oldValue() {
      return GET(this.@wrapped, 'oldValue');
    }
  }
  export class Node extends EventTarget {
    get nodeValue() {
      return GET(this.@wrapped, 'nodeValue');
    }
    set nodeValue(v) {
      SET(this.@wrapped, 'nodeValue', '' + v);
    }
    get textContent() {
      return GET(this.@wrapped, 'textContent');
    }
    set textContent(v) {
      SET(this.@wrapped, 'textContent', '' + v);
    }
    get nodeType() {
      return GET(this.@wrapped, 'nodeType');
    }
    get nodeName() {
      return GET(this.@wrapped, 'nodeName');
    }
    get baseURI() {
      return GET(this.@wrapped, 'baseURI');
    }
    get ownerDocument() {
      return WRAP(GET(this.@wrapped, 'ownerDocument'));
    }
    get parentNode() {
      return WRAP(GET(this.@wrapped, 'parentNode'));
    }
    get parentElement() {
      return WRAP(GET(this.@wrapped, 'parentElement'));
    }
    get childNodes() {
      return WRAP(GET(this.@wrapped, 'childNodes'));
    }
    get firstChild() {
      return WRAP(GET(this.@wrapped, 'firstChild'));
    }
    get lastChild() {
      return WRAP(GET(this.@wrapped, 'lastChild'));
    }
    get previousSibling() {
      return WRAP(GET(this.@wrapped, 'previousSibling'));
    }
    get nextSibling() {
      return WRAP(GET(this.@wrapped, 'nextSibling'));
    }
    hasChildNodes() {
      return CALL(this.@wrapped, 'hasChildNodes');
    }
    insertBefore(node, child) {
      return WRAP(CALL(this.@wrapped, 'insertBefore', UNWRAP(node), UNWRAP(child)));
    }
    appendChild(node) {
      return WRAP(CALL(this.@wrapped, 'appendChild', UNWRAP(node)));
    }
    replaceChild(node, child) {
      return WRAP(CALL(this.@wrapped, 'replaceChild', UNWRAP(node), UNWRAP(child)));
    }
    removeChild(child) {
      return WRAP(CALL(this.@wrapped, 'removeChild', UNWRAP(child)));
    }
    normalize() {
      CALL(this.@wrapped, 'normalize');
    }
    cloneNode(deep) {
      return WRAP(CALL(this.@wrapped, 'cloneNode', !!deep));
    }
    isEqualNode(node) {
      return CALL(this.@wrapped, 'isEqualNode', UNWRAP(node));
    }
    compareDocumentPosition(other) {
      return CALL(this.@wrapped, 'compareDocumentPosition', UNWRAP(other));
    }
    contains(other) {
      return CALL(this.@wrapped, 'contains', UNWRAP(other));
    }
    lookupPrefix(namespace) {
      return CALL(this.@wrapped, 'lookupPrefix', '' + namespace);
    }
    lookupNamespaceURI(prefix) {
      return CALL(this.@wrapped, 'lookupNamespaceURI', '' + prefix);
    }
    isDefaultNamespace(namespace) {
      return CALL(this.@wrapped, 'isDefaultNamespace', '' + namespace);
    }
  }
  constants(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12,
    DOCUMENT_POSITION_DISCONNECTED: 1,
    DOCUMENT_POSITION_PRECEDING: 2,
    DOCUMENT_POSITION_FOLLOWING: 4,
    DOCUMENT_POSITION_CONTAINS: 8,
    DOCUMENT_POSITION_CONTAINED_BY: 16,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
  });
  export class NodeIterator {
    get root() {
      return WRAP(GET(this.@wrapped, 'root'));
    }
    get referenceNode() {
      return WRAP(GET(this.@wrapped, 'referenceNode'));
    }
    get pointerBeforeReferenceNode() {
      return GET(this.@wrapped, 'pointerBeforeReferenceNode');
    }
    get whatToShow() {
      return GET(this.@wrapped, 'whatToShow');
    }
    get filter() {
      return WRAP(GET(this.@wrapped, 'filter'));
    }
    nextNode() {
      return WRAP(CALL(this.@wrapped, 'nextNode'));
    }
    previousNode() {
      return WRAP(CALL(this.@wrapped, 'previousNode'));
    }
    detach() {
      CALL(this.@wrapped, 'detach');
    }
  }
*/
