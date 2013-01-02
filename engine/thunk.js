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

  var log = false;


  function setOrigin(obj, filename, kind){
    if (filename) {
      obj.set('filename', filename);
    }
    if (kind) {
      obj.set('kind', kind);
    }
  }

  function setCode(obj, loc, code){
    var line = code.split('\n')[loc.start.line - 1];
    var pad = new Array(loc.start.column).join('-') + '^';
    obj.set('line', loc.start.line);
    obj.set('column', loc.start.column);
    obj.set('code', line + '\n' + pad);
  }

  function instructions(ops, opcodes){
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
  }

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

  function Thunk(code, instrumented){

    var opcodes = [ADD, AND, ARRAY, ARG, ARGS, ARGUMENTS, ARRAY_DONE, BINARY, BINDING, CALL, CASE, CLASS_DECL,
    CLASS_EXPR, COMPLETE, CONST, CONSTRUCT, DEBUGGER, DEFAULT, DEFINE, DUP, ELEMENT, ENUM, EXTENSIBLE, EVAL,
    FLIP, FUNCTION, GET, GET_GLOBAL, HAS_BINDING, HAS_GLOBAL, INC, INDEX, INTERNAL_MEMBER, ITERATE, JUMP,
    JEQ_NULL, JEQ_UNDEFINED, JFALSE, JLT, JLTE, JGT, JGTE, JNEQ_NULL, JNEQ_UNDEFINED, JTRUE, LET, LITERAL,
    LOG, LOOP, MEMBER, METHOD, NATIVE_CALL, NATIVE_REF, OBJECT, OR, POP, POPN, PROPERTY, PROTO, PUT, PUT_GLOBAL,
    REF, REFSYMBOL, REGEXP, REST, RETURN, ROTATE, SAVE, SCOPE_CLONE, SCOPE_POP, SCOPE_PUSH, SPREAD, SPREAD_ARG,
    SPREAD_ARRAY, STRING, SUPER_ELEMENT, SUPER_MEMBER, SYMBOL, TEMPLATE, THIS, THROW, TO_OBJECT,
    UNARY, UNDEFINED, UPDATE, VAR, WITH, YIELD];




    var thunk = this,
        ops = code.ops,
        cmds = instructions(ops, opcodes);

    function getKey(v){
      if (typeof v === 'string') {
        return v;
      }
      if (v[0] !== '@') {
        return v[1];
      }

      return context.getSymbol(v[1]);
    }

    function unwind(){
      for (var i = 0, entry; entry = code.unwinders[i]; i++) {
        if (entry.begin <= ip && ip <= entry.end) {
          if (entry.type === 'scope') {
            trace(context.popScope());
          } else if (entry.type === 'try') {
            stack[sp++] = error.value;
            ip = entry.end + 1;
            return cmds[ip];
          } else if (entry.type === 'iteration') {
            if (error && error.value && error.value.BuiltinBrand === 'StopIteration') {
              ip = entry.end;
              return cmds[ip];
            }
          }
        }
      }


      if (error) {
        if (error.value && error.value.set && error.value.BuiltinBrand !== 'StopIteration') {
          var range = code.ops[ip].range,
              loc = code.ops[ip].loc;

          if (!error.value.hasLocation) {
            error.value.hasLocation = true;
            setCode(error.value, loc, code.source);
            setOrigin(error.value, code.filename, code.displayName || code.name);
          }

          if (stacktrace) {
            if (error.value.trace) {
              [].push.apply(error.value.trace, stacktrace);
            } else {
              error.value.trace = stacktrace;
            }
            error.value.context || (error.value.context = context);
          }
        }
      }

      console.log(error);
      completion = error;
      return false;
    }



    function ADD(){
      stack[sp - 1] += ops[ip][0];
      return cmds[++ip];
    }


    function AND(){
      if (isFalsey(stack[sp - 1])) {
        ip = ops[ip][0];
        return cmds[ip];
      } else {
        sp--;
        return cmds[++ip];
      }
    }


    function ARGS(){
      stack[sp++] = [];
      return cmds[++ip];
    }

    function ARG(){
      var arg = stack[--sp];
      stack[sp - 1].push(arg);
      return cmds[++ip];
    }

    function ARGUMENTS(){
      if (code.flags.strict) {
        var args = context.args;
        stack[sp++] = context.createArguments(args);
        stack[sp++] = args;
      } else {
        var params = code.params.boundNames,
            env = context.LexicalEnvironment,
            args = context.args,
            func = context.callee;
        stack[sp++] = context.arguments = context.createArguments(args, env, params, func);
        stack[sp++] = args;
      }

      return cmds[++ip];
    }

    function ARRAY(){
      stack[sp++] = context.createArray(0);
      stack[sp++] = 0;
      return cmds[++ip];
    }

    function ARRAY_DONE(){
      var len = stack[--sp];
      stack[sp - 1].set('length', len);
      return cmds[++ip];
    }

    function BINARY(){
      var right  = stack[--sp],
          left   = stack[--sp],
          result = BinaryOperation(ops[ip][0], $$GetValue(left), $$GetValue(right));

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function BINDING(){
      var result = context.createBinding(ops[ip][0], ops[ip][1]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      return cmds[++ip];
    }

    function CALL(){
      var args     = stack[--sp],
          func     = stack[--sp],
          receiver = stack[--sp],
          result   = context.callFunction(receiver, func, args, ops[ip][0]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function CASE(){
      var result = EQUAL(stack[--sp], stack[sp - 1]);


      if (result) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        }
        sp--;
        ip = ops[ip][0];
        return cmds[ip];
      }

      return cmds[++ip];
    }

    function CLASS_DECL(){
      var def  = ops[ip][0],
          sup  = def.hasSuper ? stack[--sp] : undefined,
          result = context.createClass(def, sup);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      result = context.initializeBinding(getKey(def.name), result);
      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      return cmds[++ip];
    }

    function CLASS_EXPR(){
      var def  = ops[ip][0],
          sup  = def.hasSuper ? stack[--sp] : undefined,
          result = context.createClass(def, sup);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function COMPLETE(){
      return false;
    }

    function CONST(){
      context.initializeBinding(code.lookup(ops[ip][0]), stack[--sp], true);
      return cmds[++ip];
    }

    function CONSTRUCT(){
      var args   = stack[--sp],
          func   = stack[--sp],
          result = context.constructFunction(func, args);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }
      stack[sp++] = result;
      return cmds[++ip];
    }

    function DEBUGGER(){
      cleanup = pauseCleanup;
      ip++;
      console.log(context, thunk);
      return false;
    }

    function DEFAULT(){
      sp--;
      ip = ops[ip][0];
      return cmds[++ip];
    }

    function DEFINE(){
      var attrs  = ops[ip][0],
          val    = stack[--sp],
          key    = stack[sp - 1],
          obj    = stack[sp - 2],
          result = obj.DefineOwnProperty(key, new D[attrs](val));

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function DUP(){
      stack[sp] = stack[sp++ - 1];
      return cmds[++ip];
    }

    function ELEMENT(){
      var key    = stack[--sp],
          obj    = stack[--sp],
          result = context.getPropertyReference(key, obj);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function ENUM(){
      stack[sp - 1] = stack[sp - 1].enumerator();
      return cmds[++ip];
    }

    function EXTENSIBLE(){
      stack[sp - 1].SetExtensible(!!ops[ip][0]);
      return cmds[++ip];
    }


    function EVAL(){
      var args     = stack[--sp],
          func     = stack[--sp],
          receiver = stack[--sp];

      if (func && func.Call && func.Call.isBuiltinEval) {
        if (context.strict) {
          var scope = context.cloneScope();
        }
        var result = func.Call(null, args, true);
        scope && context.replaceScope(scope);
      } else {
        var result = context.callFunction(receiver, func, args, ops[ip][0]);
      }

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function FUNCTION(){
      stack[sp++] = context.createFunction(ops[ip][0], ops[ip][1], ops[ip][2]);
      return cmds[++ip];
    }

    function FLIP(){
      var buffer = [],
          index  = 0,
          count  = ops[ip][0];

      while (index < count) {
        buffer[index] = stack[sp - index++];
      }

      index = 0;
      while (index < count) {
        stack[sp - index] = buffer[count - ++index];
      }

      return cmds[++ip];
    }


    function GET(){
      var result = $$GetValue(stack[--sp]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function HAS_BINDING(){
      stack[sp++] = context.hasBinding(ops[ip][0]);
      return cmds[++ip];
    }

    function GET_GLOBAL(){
      var result = context.getOwnGlobal(ops[ip][0]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function HAS_GLOBAL(){
      var result = context.hasOwnGlobal(ops[ip][0]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function PUT_GLOBAL(){
      var val    = stack[--sp],
          result = context.putOwnGlobal(ops[ip][0], val, ops[ip][1]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function INC(){
      stack[sp - 1]++;
      return cmds[++ip];
    }

    function INDEX(){
      var val   = stack[--sp],
          index = stack[--sp] + ops[ip][0],
          array = stack[sp - 1];

      array.DefineOwnProperty(index+'', new Desc(val));
      stack[sp++] = index + 1;

      return cmds[++ip];
    }

    function INTERNAL_MEMBER(){
      var item = stack[--sp];
      stack[sp++] = item[ops[ip][0]];
      return cmds[++ip];
    }

    function ITERATE(){
      stack[sp - 1] = stack[sp - 1].Iterate();
      return cmds[++ip];
    }

    function LITERAL(){
      stack[sp++] = ops[ip][0];
      return cmds[++ip];
    }

    function JUMP(){
      ip = ops[ip][0];
      return cmds[ip];
    }

    function JTRUE(){
      var cmp = stack[--sp];
      if (!isFalsey(cmp)) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JFALSE(){
      var cmp = stack[--sp];
      if (isFalsey(cmp)) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JEQ_UNDEFINED(){
      if (isUndefined(stack[sp - 1])) {
        sp--;
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JNEQ_UNDEFINED(){
      if (!isUndefined(stack[sp - 1])) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      sp--;
      return cmds[++ip];
    }

    function JEQ_NULL(){
      if (stack[sp - 1] === null) {
        sp--;
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JNEQ_NULL(){
      if (stack[sp - 1] !== null) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      sp--;
      return cmds[++ip];
    }

    function JLT(){
      var cmp = stack[--sp];
      if (cmp < ops[ip][1]) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JLTE(){
      var cmp = stack[--sp];
      if (cmp <= ops[ip][1]) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JGT(){
      var cmp = stack[--sp];
      if (cmp > ops[ip][1]) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function JGTE(){
      var cmp = stack[--sp];
      if (cmp >= ops[ip][1]) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function LET(){
      context.initializeBinding(code.lookup(ops[ip][0]), stack[--sp], true);
      return cmds[++ip];
    }

    function LOG(){
      context.Realm.emit('debug', sp, stack);
      return cmds[++ip];
    }

    function LOOP(){
      var jump = cmds[++ip];
      return jump;

      if (jump.count++ > 50) {
        jump.total += jump.count;
        jump.count = 0;
        return TRACE_STACK;
      }
      return jump;
    }

    function MEMBER(){
      var obj = stack[--sp],
          key = getKey(ops[ip][0]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      var result = context.getPropertyReference(key, obj);
      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function METHOD(){
      var kind = ops[ip][0],
          obj  = stack[sp - 1],
          code = ops[ip][1],
          key  = getKey(ops[ip][2]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      var status = context.defineMethod(kind, obj, key, code);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }
      return cmds[++ip];
    }

    function NATIVE_CALL(){
      return CALL();
    }

    function NATIVE_REF(){
      if (!code.natives) {
        error = 'invalid native reference';
        return unwind;
      }
      stack[sp++] = context.Realm.natives.reference(code.lookup(ops[ip][0]), false);
      return cmds[++ip];
    }

    function OBJECT(){
      stack[sp++] = context.createObject();
      return cmds[++ip];
    }

    function OR(){
      if (isFalsey(stack[sp - 1])) {
        sp--;
        return cmds[++ip];
      } else {
        ip = ops[ip][0];
        return cmds[ip];
      }
    }

    function POP(){
      sp--;
      return cmds[++ip];
    }

    function POPN(){
      sp -= ops[ip][0];
      return cmds[++ip];
    }

    function PROPERTY(){
      var val = stack[--sp],
          obj = stack[sp - 1],
          key = getKey(ops[ip][0]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      if (val && val.Abrupt) {
        error = val;
        return unwind;
      }

      var status = obj.DefineOwnProperty(key, new Desc(val), false);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      return cmds[++ip];
    }

    function PROTO(){
      var proto = stack[--sp],
          obj = stack[sp - 1];

      if (proto && proto.Abrupt) {
        error = proto;
        return unwind;
      }

      if (obj && obj.Abrupt) {
        error = obj;
        return unwind;
      }

      var status = obj.SetInheritance(proto);
      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      return cmds[++ip];
    }

    function PUT(){
      var val    = stack[--sp],
          ref    = stack[--sp],
          status = $$PutValue(ref, val);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      stack[sp++] = val;
      return cmds[++ip];
    }

    function REGEXP(){
      stack[sp++] = context.createRegExp(ops[ip][0]);
      return cmds[++ip];
    }

    function REF(){
      var ident = code.lookup(ops[ip][0]);
      stack[sp++] = context.getReference(ident);
      return cmds[++ip];
    }


    function REFSYMBOL(){
      var symbol = code.lookup(ops[ip][0]);
      stack[sp++] = context.getSymbol(symbol);
      return cmds[++ip];
    }

    function REST(){
      var args = stack[--sp],
          offset = ops[ip][0],
          count = args.length - offset,
          array = context.createArray(0);

      for (var i=0; i < count; i++) {
        array.set(i+'', args[offset + i]);
      }
      array.set('length', i);
      stack[sp++] = array;
      return cmds[++ip];
    }

    function RETURN(){
      completion = stack[--sp];
      ip++;
      if (code.flags.generator) {
        context.currentGenerator.ExecutionContext = context;
        context.currentGenerator.State = 'closed';
        error = new AbruptCompletion('throw', context.Realm.intrinsics.StopIteration);
        unwind();
      }
      return false;
    }

    function ROTATE(){
      var buffer = [],
          item   = stack[--sp],
          index  = 0,
          count  = ops[ip][0];

      while (index < count) {
        buffer[index++] = stack[--sp];
      }

      buffer[index++] = item;

      while (index--) {
        stack[sp++] = buffer[index];
      }

      return cmds[++ip];
    }

    function SAVE(){
      completion = stack[--sp];
      return cmds[++ip];
    }

    function SCOPE_CLONE(){
      context.cloneScope();
      return cmds[++ip];
    }

    function SCOPE_POP(){
      context.popScope();
      return cmds[++ip];
    }

    function SCOPE_PUSH(){
      context.pushScope();
      return cmds[++ip];
    }

    function SPREAD(){
      var obj    = stack[--sp],
          index  = ops[ip][0],
          result = context.destructureSpread(obj, index);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SPREAD_ARG(){
      var spread = stack[--sp],
          args   = stack[sp - 1],
          status = context.spreadArguments(args, spread);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      return cmds[++ip];
    }

    function SPREAD_ARRAY(){
      var val = stack[--sp],
          index = stack[--sp] + ops[ip][0],
          array = stack[sp - 1],
          status = context.spreadArray(array, index, val);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      stack[sp++] = status;
      return cmds[++ip];
    }


    function STRING(){
      stack[sp++] = code.lookup(ops[ip][0]);
      return cmds[++ip];
    }

    function SUPER_ELEMENT(){
      var result = context.getSuperReference(stack[--sp]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SUPER_MEMBER(){
      var key = getKey(ops[ip][0]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      var result = context.getSuperReference(key);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SYMBOL(){
      var name = ops[ip][0],
          isPublic = ops[ip][1],
          hasInit = ops[ip][2];

      if (hasInit) {
        var init = stack[--sp];
        if (init && init.Abrupt) {
          error = init;
          return unwind;
        }
      } else {
        var init = context.createSymbol(name, isPublic);
      }

      var result = context.initializeSymbolBinding(name, init);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function TEMPLATE(){
      stack[sp++] = context.getTemplateCallSite(ops[ip][0]);
      return cmds[++ip];
    }

    function THIS(){
      var result = context.getThis();

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function THROW(){
      error = new AbruptCompletion('throw', stack[--sp]);
      return unwind;
    }

    function TO_OBJECT(){
      var result = stack[sp - 1] = ToObject(stack[sp - 1]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      return cmds[++ip];
    }

    function UNARY(){
      var result = UnaryOperation(ops[ip][0], stack[--sp]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function UNDEFINED(){
      stack[sp++] = undefined;
      return cmds[++ip];
    }

    var updaters = [POST_DEC, PRE_DEC, POST_INC, PRE_INC];

    function UPDATE(){
      var update = updaters[ops[ip][0]],
          result = update(stack[--sp]);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function VAR(){
      context.initializeBinding(code.lookup(ops[ip][0]), stack[--sp], false);
      return cmds[++ip];
    }

    function WITH(){
      var result = ToObject($$GetValue(stack[--sp]));

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      context.pushWith(result);
      return cmds[++ip];
    }

    function YIELD(){
      var generator = context.currentGenerator;
      generator.ExecutionContext = context;
      generator.State = 'suspended';
      context.pop();
      cleanup = yieldCleanup;
      yielded = stack[--sp];
      ip++;
      return false;
    }

    function trace(unwound){
      stacktrace || (stacktrace = []);
      stacktrace.push(unwound);
    }

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
      var f = cmds[ip],
          lastip;
      while (f) {
        lastip = ip;
        f = f();
        tracer.record(ops[lastip], sp, stack);
      }
      console.log(tracer);
    }

    function TRACE(){
      var tracer = new Trace(context, ip, cmds[ip]),
          _stack = stack.slice(0, sp);
      var f = cmds[ip];
      while (f) {
        f = f();
      }

    }

    function normalPrepare(newContext){
      thunkStack.push({
        ip: ip,
        sp: sp,
        stack: stack,
        error: error,
        prepare: prepare,
        execute: execute,
        cleanup: cleanup,
        history: history,
        completion: completion,
        stacktrace: stacktrace,
        context: context,
        log: log,
        ctx: ctx,
        yielded: yielded
      });
      ip = 0;
      sp = 0;
      stack = [];
      error = completion = stacktrace = yielded = undefined;
      log = log || cmds.log;
      context = newContext;
      var realm = context.Realm;
      if (!realm.quiet && !code.natives || realm.debugBuiltins) {
        history = context.history = [];
        execute = instrumentedExecute;
      } else {
        execute = normalExecute;
      }
    }

    function normalCleanup(){
      var result = $$GetValue(completion);
      if (thunkStack.length) {
        var v = thunkStack.pop();
        ip = v.ip;
        sp = v.sp;
        stack = v.stack;
        error = v.error;
        prepare = v.prepare;
        execute = v.execute;
        cleanup = v.cleanup;
        completion = v.completion;
        stacktrace = v.stacktrace;
        context = v.context;
        log = v.log;
        ctx = v.ctx;
        yielded = v.yielded;
        if (context) {
          history = context.history;
        }
      }
      return result;
    }


    function normalExecute(){
      var f = cmds[ip];
      while (f) f = f();
    }

    function instrumentedExecute(){
      var f = cmds[ip],
          ips = 0,
          realm = context.Realm;

      while (f) {
        history[ips++] = ops[ip];
        realm.emit('op', ops[ip], stack[sp - 1]);
        f = f();
      }
    }

    function resumePrepare(){
      delete thunk.ip;
      delete thunk.stack;
      prepare = normalPrepare;
      context = ctx;
      ctx = undefined;
    }

    function pauseCleanup(){
      thunk.ip = ip;
      thunk.stack = stack;
      stack.length = sp;
      prepare = resumePrepare;
      cleanup = normalCleanup;
      ctx = context;
      return Pause;
    }

    function yieldPrepare(ctx){
      prepare = normalPrepare;
      context = ctx;
    }

    function yieldCleanup(){
      prepare = yieldPrepare;
      cleanup = normalCleanup;
      return yielded;
    }

    function run(ctx){
      prepare(ctx);
      execute();
      return cleanup();
    }

    function send(ctx, value){
      prepare(ctx);
      stack[sp++] = value;
      execute();
      return cleanup();
    }


    var completion, yielded, stack, ip, sp, error, ctx, context, stacktrace, history;

    var executing = false, thunkStack = [];


    var prepare = normalPrepare,
        execute = normalExecute,
        cleanup = normalCleanup;

    this.run = run;
    this.send = send;
    this.code = code;
    Emitter.call(this);
  }

  inherit(Thunk, Emitter, []);

  exports.Thunk = Thunk;
  return exports;
})(typeof module !== 'undefined' ? module.exports : {});

