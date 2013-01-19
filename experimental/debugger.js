var slice = [].slice;


function Debugger(){
  each(arguments, function(global){
    assertSignature(global, 'GlobalObject', 'DebuggerObject');
  }, this);
  this.uncaughtExceptionHook
  this.enable();
}

define(Debugger.prototype, [
  function addDebuggee(global){
    assertSignature(global, 'GlobalObject', 'DebuggerObject');
  },
  function removeDebuggee(global){
    assertSignature(global, 'GlobalObject', 'DebuggerObject');
  },
  function hasDebuggee(global){
    assertSignature(global, 'GlobalObject', 'DebuggerObject');
  },
  function getDebuggees(){
  },
  function getNewestFrame(){
  },
  function findScriptURLs(query){
    assertSignature(query, 'Undefined', 'String');
  },
  function findScripts(query){
    assertSignature(query, 'Undefined', 'Query');
  },
  function clearBreakpoint(handler){
    assertSignature(handler, 'Function');
  },
  function clearAllBreakpoints(){
  },
  function clearAllWatchpoints(){
  },
  function findAllGlobals(){
  },
  function enable(){
    if (!this.enabled) {
      this.enabled = true;
      // enable
    }
  },
  function disable(){
    if (this.enabled) {
      this.enabled = false;
      // disable
    }
  }
]);


var causes = assign(create(null), { proxy: true, getter: true, setter: true });

var DebuggerDebuggeeWouldRun = Debugger.DebuggeeWouldRun = function DebuggeeWouldRun(cause){
  if (cause && cause in causes) {
    this.cause = cause;
  }
};

function debuggeeWouldRun(reason){
  return new AbruptCompletion(new DebuggerDebuggeeWouldRun(reason));
}

var DebuggerFrame = Debugger.Frame = function Frame(context){
  this.subject = context;
};

define(Debugger.Frame.prototype, [
  function eval(code){
    assertSignature(code, 'String');
  },
  function evalWithBindings(code, bindings){
    assertSignature(code, 'String');
    assertSignature(bindings, 'Object');
  },
  function pop(completion){
    assertSignature(completion, 'CompletionValue');
  },
  function replaceCall(func, thisArg/*, ...arguments*/){
    assertSignature(func, 'DebuggerObject');
    assertSignature(thisArg, 'DebuggeeValue');
    var args = slice.call(arguments, 2);
    assertSignatures(args, 'DebuggeeValue');
  },
  function getType(){ // get type(){}
  },
  function getThis(){ // get this(){}
  },
  function getOlder(){ // get older(){}
  },
  function getDepth(){ // get depth(){}
  },
  function getLive(){ // get live(){}
  },
  function getScript(){ // get script(){}
  },
  function getOffset(){ // get offset(){}
  },
  function getEnvironment(){ // get environment(){}
  },
  function getCallee(){ // get callee(){}
  },
  function getGenerator(){ // get generator(){}
  },
  function getConstructing(){ // get constructing(){}
  }
]);


var DebuggerScript = Debugger.Script = function Script(){
};

define(Debugger.Script.prototype, [
  function decompile(pretty){
    assertSignature(pretty, 'Undefined', 'Boolean');
  },
  function getAllOffsets(){
  },
  function getLineOffsets(line){
    assertSignature(line, 'Number');
  },
  function getOffsetLine(offset){
    assertSignature(offset, 'Number');
  },
  function getChildScripts(){
  },
  function setBreakpoint(offset, handler){
    assertSignature(offset, 'Number');
    assertSignature(handler, 'BreakpointHandler');
  },
  function getBreakpoints(offset){
    assertSignature(offset, 'Undefined', 'Number');
  },
  function clearBreakpoints(handler, offset){
    assertSignature(handler, 'BreakpointHandler');
    assertSignature(offset, 'Undefined', 'Number');
  },
  function getUrl(){ // get url(){}
  },
  function getStartLine(){ // get startLine(){}
  },
  function getLineCount(){ // get lineCount(){}
  },
  function getStaticLevel(){ // get staticLevel(){}
  }
]);


var DebuggerObject = Debugger.Object = function Object(debugger, obj){
  this.debugger = debugger;
  this.subject = obj;
};

define(Debugger.Object.prototype, [
  function getProperty(name){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
    // this needs to manually walk inheritance checking for accessors and proxies
  },
  function setProperty(name, value){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
    // this needs to manually walk inheritance checking for accessors and proxies
  },
  function getOwnPropertyDescriptor(name){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
  },
  function getOwnPropertyNames(){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
  },
  function defineProperty(name, attributes){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
    // TODO: need a "system realm"
  },
  function defineProperties(properties){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
    // TODO: need a "system realm"
  },
  function deleteProperty(name){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
  },
  function seal(){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
    // TODO: need a "system realm"
  },
  function freeze(){
    if (this.subject.Proxy) {
      return debuggeeWouldRun('proxy');
    }
    // TODO: need a "system realm"
  },
  function preventExtensions(){
    return this.subject.PreventExtensions();
  },
  function isSealed(){
  },
  function isFrozen(){
  },
  function isExtensible(){
    return this.subject.IsExtensible();
  },
  function copy(value){
    // TODO: need a "system realm"
  },
  function create(prototype, properties){
    // TODO: need a "system realm"
  },
  function makeDebuggeeValue(value){
    return wrap(this, value);
  },
  function decompile(pretty){
    assertSignature(pretty, 'Undefined', 'Boolean');
  },
  function call(thisArg/*, ...arguments*/){
    if (!this.subject.Call) {
      // TODO: throw TypeError
    }

    var args = [];
    for (var i=1; i < arguments.length; i++) {
      var arg = arguments[i];
      ensureDebuggeeValue(arg);
      args.push(arg);
    }

    if (thisArg && thisArg.asConstructor) {
      return wrap(this, this.subject.Construct(args));
    }

    ensureDebuggeeValue(thisArg);
    return wrap(this, this.subject.Call(thisArg, args));
  },
  function apply(thisArg, arguments){
    if (!this.subject.Construct) {
      // TODO: throw TypeError
    }

    ensureDebuggeeValue(thisArg);

    for (var i=0; i < arguments.length; i++) {
      ensureDebuggeeValue(arguments[i]);
    }

    if (thisArg && thisArg.asConstructor) {
      return wrap(this, this.subject.Construct(arguments));
    }

    ensureDebuggeeValue(thisArg);
    return wrap(this, this.subject.Call(thisArg, arguments));
  },
  function evalInGlobal(code){
  },
  function evalInGlobalWithBindings(code, bindings){
  },
  function asEnvironment(){
  },
  function setObjectWatchpoint(handler){
    assertSignature(handler, 'WatchpointHandler', 'Null');
  },
  function clearObjectWatchpoint(){
  },
  function setPropertyWatchpoint(name, handler){
    assertSignature(name, 'String');
    assertSignature(handler, 'WatchpointHandler', 'Null');
  },
  function clearPropertyWatchpoint(name){
    assertSignature(name, 'String');
  },
  function unwrap(){
  },
  function getProto(){ // get proto(){}
    return wrap(this, this.subject.GetInheritance());
  },
  // TODO feedback: Class -> Brand
  function getBrand(){ // get brand(){}
    return this.subject.BuiltinBrand;
  },
  function getCallable(){ // get callable(){}
    return !!this.subject.Call;
  },
  function getName(){ // get name(){}
  if (this.subject.getName) {
    return this.subject.getName();
  }
  },
  function getDisplayName(){ // get displayName(){}
    // TODO implement displayName
  },
  function getParameters(){ // get parameters(){}
    if (this.subject.code) {
      return this.subject.code.params.reduced;
    }
  },
  function getScript(){ // get script(){}
    if (this.subject.code) {
      return wrap(this, this.subject.code.script);
    }
  },
  function getEnvironment(){ // get environment(){}
    if (this.subject.Scope) {
      return wrap(this, this.subject.Scope);
    }
  },
  function getProxyHandler(){ // get proxyHandler(){}
    if (this.subject.ProxyHandler) {
      return wrap(this, this.subject.ProxyHandler);
    }
  },
  function getGlobal(){ // get global(){}
    return wrap(this, this.subject.Realm.global);
  }
]);


var envTypes = assign(create(null), {
  DeclarativeEnv: 'declarative',
  FunctionEnv: 'declarative',
  GlobalEnv: 'object',
  ObjectEnv: 'object'
});


var DebuggerEnvironment = Debugger.Environment = function Environment(debugger, env){
  this.debugger = debugger;
  this.subject = env;
  this.type = env.withBase ? 'with' : envTypes[env.type];
};

define(Debugger.Environment.prototype, [
  function names(){
    return this.subject.EnumerateBindings();
  },
  function getVariable(name){
    return this.subject.GetBindingValue(name, true);
  },
  function setVariable(name, value){
    return this.subject.SetMutableBinding(name, unwrap(this, value), true);
  },
  // TODO feedback: hasVariable isn't specified and should exist
  function hasVariable(name){
    return this.subject.HasBinding(name);
  },
  function getVariableDescriptor(name){
    if (!this.hasVariable(name)) {
      return this.getVariable(name); // AbruptCompletion not_defined
    } else if (this.type === 'declarative') {
      return { configurable: !(name in this.subject.deletables),
               enumerable: true,
               writable: !(name in this.subject.consts),
               value: this.getVariable(name) };
    }

    var obj = this.getObject();
    if (obj) {
      return obj.getOwnPropertyDescriptor(name);
    }
  },
  function defineVariable(name, descriptor){
    if (this.type === 'declarative') {
      if (name in this.subject.consts) {
        return this.subject.SetMutableBinding(name, descriptor.value, true); // AbruptCompletion const_assign
      }

      if (descriptor.writable) {
        this.subject.CreateMutableBinding(name, descriptor.configurable);
      } else {
        this.subject.CreateImmutableBinding(name);
      }

      this.subject.InitializeBinding(name, descriptor.value);
    } else {
      return this.getObject().defineProperty(name, descriptor);
    }
  },
  function deleteVariable(name){
    assertSignature(name, 'String');
  },
  function find(name){
    var lex = this.subject;
    while (lex) {
      if (lex.HasBinding(name)) {
        return wrap(this, lex);
      }
      lex = lex.outer;
    }
    return null;
  },
  function eval(code){
    // TODO
  },
  function evalWithBindings(code, bindings){
    // TODO
  },
  function getParent(){ // get parent(){}
    return wrap(this, this.subject.outer);
  },
  function getObject(){ // get object(){}
    if (this.type === 'object') {
      return wrap(this, this.subject.bindings);
    } else if (this.type === 'with') {
      return wrap(this, this.subject.WithBaseObject());
    } else {
      // return TypeError AbruptCompletion
      // TODO feedback: accessor throwers are dev hostile
      return null;
    }
  },
  function getCallee(){ // get callee(){}
    if (this.subject.type === 'FunctionEnv') {
      return wrap(this, this.subject.thisValue);
    }
    return null;
  }
]);
