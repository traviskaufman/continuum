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
};

define(Debugger.Object.prototype, [
  function getProperty(name){
    assertSignature(name, 'String');
  },
  function setProperty(name, value){
    assertSignature(name, 'String');
    assertSignature(value, 'DebuggeeValue');
  },
  function getOwnPropertyDescriptor(name){
    assertSignature(name, 'String');
  },
  function getOwnPropertyNames(){
  },
  function defineProperty(name, attributes){
    assertSignature(name, 'String');
    assertSignature(attributes, 'Descriptor');
  },
  function defineProperties(properties){
    assertSignature(properties, 'Object');
  },
  function deleteProperty(name){
    assertSignature(name, 'String');
  },
  function seal(){
  },
  function freeze(){
  },
  function preventExtensions(){
  },
  function isSealed(){
  },
  function isFrozen(){
  },
  function isExtensible(){
  },
  function copy(value){
    assertSignature(value, 'DebuggerObject');
  },
  function create(prototype, properties){
    assertSignature(prototype, 'DebuggerObject', 'Null');
    assertSignature(properties, 'Undefined', 'Object');
  },
  function makeDebuggeeValue(value){
    assertSignature(value, 'Any');
  },
  function decompile(pretty){
    assertSignature(pretty, 'Undefined', 'Boolean');
  },
  function call(thisArg/*, ...arguments*/){
    assertSignature(thisArg, 'DebuggeeValue', 'AsConstructor');
    var args = slice.call(arguments, 1);
    assertSignatures(args, 'DebuggeeValue');
  },
  function apply(thisArg, arguments){
    assertSignature(thisArg, 'DebuggeeValue', 'AsConstructor');
    assertSignatures(arguments, 'DebuggeeValue');
  },
  function evalInGlobal(code){
    assertSignature(code, 'String');
  },
  function evalInGlobalWithBindings(code, bindings){
    assertSignature(code, 'String');
    assertSignature(bindings, 'Object');
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
  },
  function getClass(){ // get class(){}
  },
  function getCallable(){ // get callable(){}
  },
  function getName(){ // get name(){}
  },
  function getDisplayName(){ // get displayName(){}
  },
  function getParameters(){ // get parameters(){}
  },
  function getScript(){ // get script(){}
  },
  function getEnvironment(){ // get environment(){}
  },
  function getProxyHandler(){ // get proxyHandler(){}
  },
  function getGlobal(){ // get global(){}
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
