var thunk = (function(exports){
  "use strict";
  var objects   = require('./lib/objects'),
      constants = require('./constants'),
      operators = require('./object-model/operators'),
      Nil       = require('./object-model/$Nil'),
      Emitter   = require('./lib/Emitter');

  var isFalsey        = Nil.isFalsey,
      isNullish       = Nil.isNullish,
      isUndefined     = Nil.isUndefined,
      define          = objects.define,
      inherit         = objects.inherit,
      Hash            = objects.Hash,
      UnaryOperation  = operators.UnaryOperation,
      BinaryOperation = operators.BinaryOperation,
      ToObject        = operators.$$ToObject,
      $$GetValue      = operators.$$GetValue,
      $$PutValue      = operators.$$PutValue,
      EQUAL           = operators.EQUAL,
      PRE_INC         = operators.PRE_INC,
      POST_INC        = operators.POST_INC,
      PRE_DEC         = operators.PRE_DEC,
      POST_DEC        = operators.POST_DEC,
      Pause           = constants.SYMBOLS.Pause,
      Empty           = constants.SYMBOLS.Empty,
      Resume          = constants.SYMBOLS.Resume;

  var AbruptCompletion = require('./errors').AbruptCompletion;



  function Desc(v){
    this.Value = v;
  }

  Desc.prototype = {
    isDataDescriptor: true,
    isDescriptor: true,
    Configurable: true,
    Enumerable: true,
    Writable: true
  };



  var D = (function(d, i){
    while (i--) {
      d[i] = new Function('return function '+
        ((i & 1) ? 'E' : '_') +
        ((i & 2) ? 'C' : '_') +
        ((i & 4) ? 'W' : '_') +
        '(v){ this.Value = v }')();

      d[i].prototype = {
        Enumerable  : (i & 1) > 0,
        Configurable: (i & 2) > 0,
        Writable    : (i & 4) > 0
      };
    }
    return d;
  })([], 8);


  function getKey(context, v){
    if (typeof v === 'string') {
      return v;
    }
    if (v[0] !== '@') {
      return v[1];
    }

    return context.getSymbol(v[1]);
  }


  function unwind(context){
    var error = context.error;

    for (var i = 0, entry; entry = context.code.unwinders[i]; i++) {
      if (entry.begin <= context.ip && context.ip <= entry.end) {
        if (entry.type === 'scope') {
          context.stacktrace || (context.stacktrace = []);
          context.stacktrace.push(context.popScope());
        } else if (entry.type === 'try') {
          context.stack[context.sp++] = error.value;
          context.error = undefined;
          context.ip = entry.end + 1;
          return context.cmds[context.ip];
        } else if (entry.type === 'iteration') {
          if (error && error.value && error.value.BuiltinBrand === 'StopIteration') {
            context.ip = entry.end;
            context.error = undefined;
            return context.cmds[context.ip];
          }
        }
      }
    }


    if (error && error.value && error.value.set && error.value.BuiltinBrand !== 'StopIteration') {
      var code  = context.code,
          range = code.ops[context.ip].range,
          loc   = code.ops[context.ip].loc,
          err   = error.value;

      if (!err.hasLocation) {
        err.hasLocation = true;
        setCode(err, loc, code.source);
        var name = code.displayName || code.name;
        setOrigin(err, code.filename, name);

        if (name) {
          name = 'in '+name+' ';
        }

        console.log('Uncaught Exception '+name+'at line '+err.Get('line')+'\n'+
                    err.Get('name')+': '+err.Get('message')+'\n'+
                    err.Get('code'));
        console.dir(err);
      }

      if (context.stacktrace) {
        if (err.trace) {
          [].push.apply(err.trace, context.stacktrace);
        } else {
          err.trace = context.stacktrace;
        }
        err.context || (err.context = context);
      }
    }

    context.completion = error;
    context.error = undefined;
    return false;
  }


  function setOrigin(obj, filename, name){
    filename && obj.set('filename', filename);
    name && obj.set('name', name);
  }

  function setCode(obj, loc, code){
    var line = code.split('\n')[loc.start.line - 1];
    var pad = new Array(loc.start.column).join('-') + '^';
    obj.set('line', loc.start.line);
    obj.set('column', loc.start.column);
    obj.set('code', line + '\n' + pad);
  }




  function ADD(context){
    context.stack[context.sp - 1] += context.ops[context.ip][0];
    return context.cmds[++context.ip];
  }

  function AND(context){
    if (isFalsey(context.stack[context.sp - 1])) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    context.sp--;
    return context.cmds[++context.ip];
  }

  function ARGS(context){
    context.stack[context.sp++] = [];
    return context.cmds[++context.ip];
  }

  function ARG(context){
    var arg = context.stack[--context.sp];
    context.stack[context.sp - 1].push(arg);
    return context.cmds[++context.ip];
  }

  function ARGUMENTS(context){
    if (context.code.flags.strict) {
      var args = context.args;
      context.stack[context.sp++] = context.createArguments(args);
      context.stack[context.sp++] = args;
    } else {
      var params = context.code.params.boundNames,
          env    = context.LexicalEnvironment,
          args   = context.args,
          func   = context.callee;

      context.stack[context.sp++] = context.arguments = context.createArguments(args, env, params, func);
      context.stack[context.sp++] = args;
    }

    return context.cmds[++context.ip];
  }

  function ARRAY(context){
    context.stack[context.sp++] = context.createArray(0);
    context.stack[context.sp++] = 0;
    return context.cmds[++context.ip];
  }

  function ARRAY_DONE(context){
    var len = context.stack[--context.sp];
    context.stack[context.sp - 1].set('length', len);
    return context.cmds[++context.ip];
  }

  function BINARY(context){
    var right  = context.stack[--context.sp],
        left   = context.stack[--context.sp],
        result = BinaryOperation(context.ops[context.ip][0], $$GetValue(left), $$GetValue(right));

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function BINDING(context){
    var result = context.createBinding(context.ops[context.ip][0], context.ops[context.ip][1]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    return context.cmds[++context.ip];
  }


  function $$EvaluateCall(ref, func, args, tail){
    if (!func || !func.Call) {
      return $$ThrowException('called_non_callable', [ref && ref.name]);
    }

    if (ref && ref.Reference) {
      var receiver = $$IsPropertyReference(ref) ? $$GetThisValue(ref) : ref.base.WithBaseObject();
    }

    return
  }


  function CALL(context){
    var args = context.stack[--context.sp],
        func = context.stack[--context.sp],
        ref  = context.stack[--context.sp],
        tail = context.ops[context.ip][0];

    if (!func || !func.Call) {
      context.error = $$ThrowException('called_non_callable', [ref && ref.name]);
      return unwind;
    }

    var receiver = context.resolveReceiver(ref);

    if (func.code && tail) {
      func.prepare(receiver, args, context);
      return context.cmds[context.ip];
    } else {
      var result = func.Call(receiver, args);

      if (result && result.Abrupt) {
        context.error = result;
        return unwind;
      }

      context.stack[context.sp++] = result;
    }

    return context.cmds[++context.ip];
  }

  function CASE(context){
    var result = EQUAL(context.stack[--context.sp], context.stack[context.sp - 1]);

    if (result) {
      if (result.Abrupt) {
        context.error = result;
        return unwind;
      }
      context.sp--;
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }

    return context.cmds[++context.ip];
  }

  function CLASS_DECL(context){
    var def    = context.ops[context.ip][0],
        sup    = def.hasSuper ? context.stack[--context.sp] : undefined,
        result = context.createClass(def, sup);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    result = context.initializeBinding(getKey(context, def.name), result);
    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    return context.cmds[++context.ip];
  }

  function CLASS_EXPR(context){
    var def    = context.ops[context.ip][0],
        sup    = def.hasSuper ? context.stack[--context.sp] : undefined,
        result = context.createClass(def, sup);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function COMPLETE(context){
    return false;
  }

  function CONST(context){
    context.initializeBinding(context.code.lookup(context.ops[context.ip][0]), context.stack[--context.sp], true);
    return context.cmds[++context.ip];
  }

  function CONSTRUCT(context){
    var args   = context.stack[--context.sp],
        func   = context.stack[--context.sp],
        result = context.constructFunction(func, args);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }
    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function DEBUGGER(context){
    context.ip++;
    context.completion = Pause;
    console.log(context);
    return false;
  }

  function DEFAULT(context){
    context.sp--;
    context.ip = context.ops[context.ip][0];
    return context.cmds[++context.ip];
  }

  function DEFINE(context){
    var attrs  = context.ops[context.ip][0],
        val    = context.stack[--context.sp],
        key    = context.stack[context.sp - 1],
        obj    = context.stack[context.sp - 2],
        result = obj.DefineOwnProperty(key, new D[attrs](val));

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function DUP(context){
    context.stack[context.sp] = context.stack[context.sp++ - 1];
    return context.cmds[++context.ip];
  }

  function ELEMENT(context){
    var key    = context.stack[--context.sp],
        obj    = context.stack[--context.sp],
        result = context.getPropertyReference(key, obj);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function ENUM(context){
    context.stack[context.sp - 1] = context.stack[context.sp - 1].enumerator();
    return context.cmds[++context.ip];
  }

  function EXTENSIBLE(context){
    context.stack[context.sp - 1].SetExtensible(!!context.ops[context.ip][0]);
    return context.cmds[++context.ip];
  }


  function EVAL(context){
    var args     = context.stack[--context.sp],
        func     = context.stack[--context.sp],
        receiver = context.stack[--context.sp];

    if (func && func.Call && func.Call.isBuiltinEval) {
      if (context.strict) {
        var scope = context.cloneScope();
      }
      var result = func.Call(null, args, true);
      scope && context.replaceScope(scope);
    } else {
      var result = context.callFunction(receiver, func, args, context.ops[context.ip][0]);
    }

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function FUNCTION(context){
    var op     = context.ops[context.ip],
        isExpr = op[0],
        name   = op[1],
        code   = op[2];

    context.stack[context.sp++] = context.createFunction(isExpr, name, code);
    return context.cmds[++context.ip];
  }

  function FLIP(context){
    var buffer = [],
        index  = 0,
        count  = context.ops[context.ip][0];

    while (index < count) {
      buffer[index] = context.stack[context.sp - index++];
    }

    index = 0;
    while (index < count) {
      context.stack[context.sp - index] = buffer[count - ++index];
    }

    return context.cmds[++context.ip];
  }


  function GET(context){
    var result = $$GetValue(context.stack[--context.sp]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function HAS_BINDING(context){
    context.stack[context.sp++] = context.hasBinding(context.ops[context.ip][0]);
    return context.cmds[++context.ip];
  }

  function GET_GLOBAL(context){
    var result = context.getOwnGlobal(context.ops[context.ip][0]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function HAS_GLOBAL(context){
    var result = context.hasOwnGlobal(context.ops[context.ip][0]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function PUT_GLOBAL(context){
    var val    = context.stack[--context.sp],
        result = context.putOwnGlobal(context.ops[context.ip][0], val, context.ops[context.ip][1]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function INC(context){
    context.stack[context.sp - 1]++;
    return context.cmds[++context.ip];
  }

  function INDEX(context){
    var val   = context.stack[--context.sp],
        index = context.stack[--context.sp] + context.ops[context.ip][0],
        array = context.stack[context.sp - 1];

    array.DefineOwnProperty(index+'', new Desc(val));
    context.stack[context.sp++] = index + 1;

    return context.cmds[++context.ip];
  }

  function INTERNAL_MEMBER(context){
    var item = context.stack[--context.sp];
    context.stack[context.sp++] = item[context.ops[context.ip][0]];
    return context.cmds[++context.ip];
  }

  function ITERATE(context){
    context.stack[context.sp - 1] = context.stack[context.sp - 1].Iterate();
    return context.cmds[++context.ip];
  }

  function LITERAL(context){
    context.stack[context.sp++] = context.ops[context.ip][0];
    return context.cmds[++context.ip];
  }

  function JUMP(context){
    context.ip = context.ops[context.ip][0];
    return context.cmds[context.ip];
  }

  function JTRUE(context){
    var cmp = context.stack[--context.sp];
    if (!isFalsey(cmp)) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JFALSE(context){
    var cmp = context.stack[--context.sp];
    if (isFalsey(cmp)) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JEQ_UNDEFINED(context){
    if (isUndefined(context.stack[context.sp - 1])) {
      context.sp--;
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JNEQ_UNDEFINED(context){
    if (!isUndefined(context.stack[context.sp - 1])) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    context.sp--;
    return context.cmds[++context.ip];
  }

  function JEQ_NULL(context){
    if (context.stack[context.sp - 1] === null) {
      context.sp--;
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JNEQ_NULL(context){
    if (context.stack[context.sp - 1] !== null) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    context.sp--;
    return context.cmds[++context.ip];
  }

  function JLT(context){
    var cmp = context.stack[--context.sp];
    if (cmp < context.ops[context.ip][1]) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JLTE(context){
    var cmp = context.stack[--context.sp];
    if (cmp <= context.ops[context.ip][1]) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JGT(context){
    var cmp = context.stack[--context.sp];
    if (cmp > context.ops[context.ip][1]) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function JGTE(context){
    var cmp = context.stack[--context.sp];
    if (cmp >= context.ops[context.ip][1]) {
      context.ip = context.ops[context.ip][0];
      return context.cmds[context.ip];
    }
    return context.cmds[++context.ip];
  }

  function LET(context){
    context.initializeBinding(context.code.lookup(context.ops[context.ip][0]), context.stack[--context.sp], true);
    return context.cmds[++context.ip];
  }

  function LOG(context){
    context.Realm.emit('debug', context.sp, context.stack);
    return context.cmds[++context.ip];
  }

  function LOOP(context){
    var jump = context.cmds[++context.ip];
    return jump;

    if (jump.count++ > 50) {
      jump.total += jump.count;
      jump.count = 0;
      return TRACE_STACK;
    }
    return jump;
  }

  function MEMBER(context){
    var obj = context.stack[--context.sp],
        key = getKey(context, context.ops[context.ip][0]);

    if (key && key.Abrupt) {
      context.error = key;
      return unwind;
    }

    var result = context.getPropertyReference(key, obj);
    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function METHOD(context){
    var kind = context.ops[context.ip][0],
        obj  = context.stack[context.sp - 1],
        code = context.ops[context.ip][1],
        key  = getKey(context, context.ops[context.ip][2]);

    if (key && key.Abrupt) {
      context.error = key;
      return unwind;
    }

    var status = context.defineMethod(kind, obj, key, context.code);

    if (status && status.Abrupt) {
      context.error = status;
      return unwind;
    }
    return context.cmds[++context.ip];
  }

  function NATIVE_CALL(context){
    return CALL();
  }

  function NATIVE_REF(context){
    if (!context.code.natives) {
      context.error = 'invalid native reference';
      return unwind;
    }
    context.stack[context.sp++] = context.Realm.natives.reference(context.code.lookup(context.ops[context.ip][0]), false);
    return context.cmds[++context.ip];


    // context.LexicalEnvironment = context.Realm.natives;
    // var ret = REF(context);
    // context.LexicalEnvironment = scope;
    // return ret;
  }

  function OBJECT(context){
    context.stack[context.sp++] = context.createObject();
    return context.cmds[++context.ip];
  }

  function OR(context){
    if (isFalsey(context.stack[context.sp - 1])) {
      context.sp--;
      return context.cmds[++context.ip];
    }
    context.ip = context.ops[context.ip][0];
    return context.cmds[context.ip];
  }

  function POP(context){
    context.sp--;
    return context.cmds[++context.ip];
  }

  function POPN(context){
    context.sp -= context.ops[context.ip][0];
    return context.cmds[++context.ip];
  }

  function PROPERTY(context){
    var val = context.stack[--context.sp],
        obj = context.stack[context.sp - 1],
        key = getKey(context, context.ops[context.ip][0]);

    if (key && key.Abrupt) {
      context.error = key;
      return unwind;
    }

    if (val && val.Abrupt) {
      context.error = val;
      return unwind;
    }

    var status = obj.DefineOwnProperty(key, new Desc(val), false);

    if (status && status.Abrupt) {
      context.error = status;
      return unwind;
    }

    return context.cmds[++context.ip];
  }

  function PROTO(context){
    var proto = context.stack[--context.sp],
        obj   = context.stack[context.sp - 1];

    if (proto && proto.Abrupt) {
      context.error = proto;
      return unwind;
    }

    if (obj && obj.Abrupt) {
      context.error = obj;
      return unwind;
    }

    var status = obj.SetInheritance(proto);
    if (status && status.Abrupt) {
      context.error = status;
      return unwind;
    }

    return context.cmds[++context.ip];
  }

  function PUT(context){
    var val    = context.stack[--context.sp],
        ref    = context.stack[--context.sp],
        status = $$PutValue(ref, val);

    if (status && status.Abrupt) {
      context.error = status;
      return unwind;
    }

    context.stack[context.sp++] = val;
    return context.cmds[++context.ip];
  }

  function REGEXP(context){
    context.stack[context.sp++] = context.createRegExp(context.ops[context.ip][0]);
    return context.cmds[++context.ip];
  }

  function REF(context){
    var ident = context.code.lookup(context.ops[context.ip][0]);
    context.stack[context.sp++] = context.getReference(ident);
    return context.cmds[++context.ip];
  }


  function REFSYMBOL(context){
    var symbol = context.code.lookup(context.ops[context.ip][0]);
    context.stack[context.sp++] = context.getSymbol(symbol);
    return context.cmds[++context.ip];
  }

  function REST(context){
    var args   = context.stack[--context.sp],
        offset = context.ops[context.ip][0],
        count  = args.length - offset,
        array  = context.createArray(0);

    for (var i=0; i < count; i++) {
      array.set(i+'', args[offset + i]);
    }
    array.set('length', i);
    context.stack[context.sp++] = array;

    return context.cmds[++context.ip];
  }

  function RETURN(context){
    context.completion = context.stack[--context.sp];
    context.ip++;

    if (context.code.flags.generator) {
      context.currentGenerator.ExecutionContext = context;
      context.currentGenerator.State = 'closed';
      context.error = new AbruptCompletion('throw', context.Realm.intrinsics.StopIteration);
      unwind(context);
    }

    return false;
  }

  function ROTATE(context){
    var buffer = [],
        item   = context.stack[--context.sp],
        index  = 0,
        count  = context.ops[context.ip][0];

    while (index < count) {
      buffer[index++] = context.stack[--context.sp];
    }

    buffer[index++] = item;

    while (index--) {
      context.stack[context.sp++] = buffer[index];
    }

    return context.cmds[++context.ip];
  }

  function SAVE(context){
    context.completion = context.stack[--context.sp];
    return context.cmds[++context.ip];
  }

  function SCOPE_CLONE(context){
    context.cloneScope();
    return context.cmds[++context.ip];
  }

  function SCOPE_POP(context){
    context.popScope();
    return context.cmds[++context.ip];
  }

  function SCOPE_PUSH(context){
    context.pushScope();
    return context.cmds[++context.ip];
  }

  function SPREAD(context){
    var obj    = context.stack[--context.sp],
        index  = context.ops[context.ip][0],
        result = context.destructureSpread(obj, index);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function SPREAD_ARG(context){
    var spread = context.stack[--context.sp],
        args   = context.stack[context.sp - 1],
        status = context.context.spreadArguments(args, context.spread);

    if (status && status.Abrupt) {
      context.error = status;
      return unwind;
    }

    return context.cmds[++context.ip];
  }

  function SPREAD_ARRAY(context){
    var val    = context.stack[--context.sp],
        index  = context.stack[--context.sp] + context.ops[context.ip][0],
        array  = context.stack[context.sp - 1],
        status = context.context.spreadArray(array, index, val);

    if (status && status.Abrupt) {
      context.error = status;
      return unwind;
    }

    context.stack[context.sp++] = status;
    return context.cmds[++context.ip];
  }


  function STRING(context){
    context.stack[context.sp++] = context.code.lookup(context.ops[context.ip][0]);
    return context.cmds[++context.ip];
  }

  function SUPER_ELEMENT(context){
    var result = context.getSuperReference(context.stack[--context.sp]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function SUPER_MEMBER(context){
    var key = getKey(context, context.ops[context.ip][0]);

    if (key && key.Abrupt) {
      context.error = key;
      return unwind;
    }

    var result = context.getSuperReference(key);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function SYMBOL(context){
    var name = context.ops[context.ip][0],
        isPublic = context.ops[context.ip][1],
        hasInit = context.ops[context.ip][2];

    if (hasInit) {
      var init = context.stack[--context.sp];
      if (init && init.Abrupt) {
        context.error = init;
        return unwind;
      }
    } else {
      var init = context.createSymbol(name, isPublic);
    }

    var result = context.initializeSymbolBinding(name, init);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function TEMPLATE(context){
    context.stack[context.sp++] = context.getTemplateCallSite(context.ops[context.ip][0]);
    return context.cmds[++context.ip];
  }

  function THIS(context){
    var result = context.getThis();

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function THROW(context){
    context.error = new AbruptCompletion('throw', context.stack[--context.sp]);
    return unwind;
  }

  function TO_OBJECT(context){
    var result = context.stack[context.sp - 1] = ToObject(context.stack[context.sp - 1]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    return context.cmds[++context.ip];
  }

  function UNARY(context){
    var result = UnaryOperation(context.ops[context.ip][0], context.stack[--context.sp]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function UNDEFINED(context){
    context.stack[context.sp++] = undefined;
    return context.cmds[++context.ip];
  }

  var updaters = [POST_DEC, PRE_DEC, POST_INC, PRE_INC];

  function UPDATE(context){
    var update = updaters[context.ops[context.ip][0]],
        result = update(context.stack[--context.sp]);

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.stack[context.sp++] = result;
    return context.cmds[++context.ip];
  }

  function VAR(context){
    context.initializeBinding(context.code.lookup(context.ops[context.ip][0]), context.stack[--context.sp], false);
    return context.cmds[++context.ip];
  }

  function WITH(context){
    var result = ToObject($$GetValue(context.stack[--context.sp]));

    if (result && result.Abrupt) {
      context.error = result;
      return unwind;
    }

    context.pushWith(result);
    return context.cmds[++context.ip];
  }

  function YIELD(context){
    context.currentGenerator.ExecutionContext = context;
    context.currentGenerator.State = 'suspended';
    context.completion = context.stack[--context.sp];
    context.ip++;
    context.pop();
    return false;
  }

  function trace(unwound){
    stacktrace || (stacktrace = []);
    stacktrace.push(unwound);
  }



/*

  function Action(op, result){
    this.ip = op.ip;
    this.op = op;
    this.result = result;
  }

  function Trace(context, ip, jump){
    this.context = context;
    this.start = jump[0];
    this.end = ip;
    this.total = this.end - this.start;
    this.record = [];
    this.count = 0;
    this.index = new Array(this.total);
    this.complete = false;
  }

  define(Trace.prototype, [
    function record(op, result){
      var offset = op.ip - this.start;
      if (!(offset in this.index)) {
        var action = new Action(op, result);
        this.record[this.count++] = action;
        this.index[offset] = action;
      } else if (op.ip === this.end) {
        this.complete = true;
      }
      return this.complete;
    }
  ]);

  function Change(type, from, to){
    this.type = type;
    if (to === undefined) {
      this.index = from;
    } else {
      this.from = from;
      this.to = to;
    }
  }

  define(Change.prototype, [
    function compare(change){
      if (change.type === this.type) {
        if ('index' in this) {
          return change.index === this.index;
        } else {
          return change.from - change.to === this.from - this.to;
        }
      }
      return false;
    }
  ]);

  function StackTrace(sp, stack){
    this.stack = stack.slice(0, sp);
    this.sp = sp;
    this.ops = new Hash;
  }

  define(StackTrace.prototype, [
    function record(op, sp, stack){
      var ops = this.ops[op.op.name] || (this.ops[op.op.name] = []);
      ops.push(this.diff(sp, stack));
    },
    function diff(sp, stack){
      var max = Math.max(sp, this.sp),
          diffs = [];

      stack = stack.slice(0, sp);

      for (var i=0; i < max; i++) {
        if (this.stack[i] !== stack[i]) {
          diffs.push(i);
        }
      }

      if (!diffs.length) {
        return diffs;
      }

      var changes = [];

      for (var i=0; i < diffs.length; i++) {
        if (diffs[i] > sp) {
          var index = stack.indexOf(this.stack[diffs[i]]);
          if (~index) {
            changes.push(new Change('move', diffs[i], index));
          } else {
            changes.push(new Change('remove', diffs[i]));
          }
        } else if (diffs[i] > this.sp) {
          var index = this.stack.indexOf(stack[diffs[i]]);
          if (~index) {
            changes.push(new Change('move', index, diffs[i]));
          } else {
            changes.push(new Change('add', diffs[i]));
          }
        } else {
          var index1 = this.stack.indexOf(stack[diffs[i]]);
          var index2 = stack.indexOf(this.stack[diffs[i]]);
          if (~index1) {
            if (~index2) {
              if (index1 === index2) {
                changes.push(new Change('replace', index1));
              } else {
                changes.push(new Change('swap', index1, diffs[i]));
              }
            } else {
              changes.push(new Change('remove', index1));
            }
          } else if (~index2) {
            changes.push(new Change('add', index2));
          } else if (this.sp < sp) {
            changes.push(new Change('push', sp));
          } else {
            changes.push(new Change('pop', this.sp));
          }
        }
      }

      this.sp = sp;
      this.stack = stack.slice(0, sp);
      return changes;
    },
    function summary(){
      for (var k in this.ops) {

      }
    }
  ]);

  function TRACE_STACK(){
    var tracer = new StackTrace(sp, stack);
    var f = cmds[context.ip],
        lastip;
    while (f) {
      lastip = ip;
      f = f();
      tracer.record(ops[lastip], sp, stack);
    }
    console.log(tracer);
  }

  function TRACE(){
    var tracer = new Trace(context, ip, cmds[context.ip]),
        _stack = stack.slice(0, sp);
    var f = cmds[context.ip];

    while (f) f = f();
  }

*/

  var opcodes = [ADD, AND, ARRAY, ARG, ARGS, ARGUMENTS, ARRAY_DONE, BINARY, BINDING, CALL, CASE, CLASS_DECL,
    CLASS_EXPR, COMPLETE, CONST, CONSTRUCT, DEBUGGER, DEFAULT, DEFINE, DUP, ELEMENT, ENUM, EXTENSIBLE, EVAL,
    FLIP, FUNCTION, GET, GET_GLOBAL, HAS_BINDING, HAS_GLOBAL, INC, INDEX, INTERNAL_MEMBER, ITERATE, JUMP,
    JEQ_NULL, JEQ_UNDEFINED, JFALSE, JLT, JLTE, JGT, JGTE, JNEQ_NULL, JNEQ_UNDEFINED, JTRUE, LET, LITERAL,
    LOG, LOOP, MEMBER, METHOD, NATIVE_CALL, NATIVE_REF, OBJECT, OR, POP, POPN, PROPERTY, PROTO, PUT, PUT_GLOBAL,
    REF, REFSYMBOL, REGEXP, REST, RETURN, ROTATE, SAVE, SCOPE_CLONE, SCOPE_POP, SCOPE_PUSH, SPREAD, SPREAD_ARG,
    SPREAD_ARRAY, STRING, SUPER_ELEMENT, SUPER_MEMBER, SYMBOL, TEMPLATE, THIS, THROW, TO_OBJECT,
    UNARY, UNDEFINED, UPDATE, VAR, WITH, YIELD];

  exports.instructions = function instructions(ops){
    var out = [],
        traceNext;

    for (var i=0; i < ops.length; i++) {
      out[i] = opcodes[+ops[i].op];
      out[i].ip = i;
      if (out[i].name === 'LOG') {
        out.log = true;
      } else if (out[i].name === 'LOOP' ) {
        traceNext = true;
      } else if (traceNext) {
        out[i].count = out[i].total = 0;
        traceNext = false;
      }
    }
    return out;
  };

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});

