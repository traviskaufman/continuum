import {
  dict
} from '@dict';

import {
  WeakMap;
} from '@weakmap';


function ensureHandler(value){
  if (value !== undefined && typeof value !== 'function') {
    throw new TypeError(`${$$CallerName()} must be a function or undefined`);
  }
}

export class Debugger {
  private @enabled,
          @globals,
          @uncaughtExceptionHook,
          @onNewScript,
          @onDebuggerStatement,
          @onEnterFrame,
          @onEnterFrame,
          @onThrow,
          @onException,
          @onExceptionUnwind,
          @onError,
          @onNewGlobalObject,

  constructor(...globals){
    this.uncaughtExceptionHook = null;
    this.@globals = new WeakMap;

    for (let global of globals) {
      this.addDebuggee(global);
    }

    this.enabled = true;
  }

  addDebuggee(global){
    if (!hasBrand(global, 'GlobalObject')) {
      throw new TypeError('Only global objects may be debugged');
    }

    const globals = this.@globals;

    if (globals.has(global)) {
      return globals.get(global);
    }

    if ($$CurrentRealm() === $$Get(global, 'Realm')) {
      // TODO this check isn't adequate since Realms are inherited for the purpose of modules
      throw new Error('Debuggee must belong to a different realm than debugger');
    }

    return globals.set(global, new DebuggerObject(global));
  }

  removeDebuggee(global){
    if (!hasBrand(global, 'GlobalObject')) {
      if (global instanceof DebuggerObject) {

      }
    }
    this.@globals.delete(global);
  }

  hasDebuggee(global){

  }

  getDebuggees(){

  }

  getNewestFrame(){

  }

  findScriptURLs(query){
    assertSignature(query, Undefined, String);
  }

  findScripts(query){
    assertSignature(query, Undefined, Query);
  }

  set enabled(value){
    if (value !== this.@enabled) {
      this.@enabled = value;
      $$ToggleDebugger(this, value);
    }
  }

  get enabled(){
    return this.@enabled;
  }

  get uncaughtExceptionHook(){
    return $$GetUncaughtExceptionHook(this);
  }

  set uncaughtExceptionHook(value){
    if (typeof value !== 'function' && value !== null) {
      throw new TypeError('uncaughtExceptionHook must be either a function or null');
    }
    $$SetUncaughtExceptionHook(this, value);
  }

  get onNewScript(){
    return this.@onNewScript;
  }

  set onNewScript(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onNewScript) {
      this.@onNewScript = value;
      this.@setHandler('onNewScript', value);
    }
  }

  get onDebuggerStatement(){
    return this.@onDebuggerStatement;
  }

  set onDebuggerStatement(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onDebuggerStatement) {
      this.@onDebuggerStatement = value;
      this.@setHandler('onDebuggerStatement', value);
    }
  }

  get onEnterFrame(){
    return this.@onEnterFrame;
  }

  set onEnterFrame(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onEnterFrame) {
      this.@onEnterFrame = value;
      this.@setHandler('onEnterFrame', value);
    }
  }

  get onThrow(){
    return this.@onThrow;
  }

  set onThrow(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onThrow) {
      this.@onThrow = value;
      this.@setHandler('onThrow', value);
    }
  }

  get onException(){
    return this.@onException;
  }

  set onException(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onException) {
      this.@onException = value;
      this.@setHandler('onException', value);
    }
  }

  get onExceptionUnwind(){
    return this.@onExceptionUnwind;
  }

  set onExceptionUnwind(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onExceptionUnwind) {
      this.@onExceptionUnwind = value;
      this.@setHandler('onExceptionUnwind', value);
    }
  }

  get onError(){
    return this.@onError;
  }

  set onError(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onError) {
      this.@onError = value;
      this.@setHandler('onError', value);
    }
  }

  get onNewGlobalObject(){
    return this.@onNewGlobalObject;
  }

  set onNewGlobalObject(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onNewGlobalObject) {
      this.@onNewGlobalObject = value;
      this.@setHandler('onNewGlobalObject', value);
    }
  }
}


const DebuggerDebuggeeWouldRun = Debugger.DebuggeeWouldRun = class DebuggeeWouldRun {
  constructor(cause){
    if (cause) {
      this.cause = cause;
    }
  }
};

const DebuggerFrame = Debugger.Frame = class Frame {
  constructor(){

  }

  eval(code){
    assertSignature(code, String);
  }

  evalWithBindings(code, bindings){
    assertSignature(code, String);
    assertSignature(bindings, Object);
  }

  pop(completion){
    assertSignature(completion, CompletionValue);
  }

  replaceCall(func, thisArg, ...arguments){
    assertSignature(func, DebuggerObject);
    assertSignature(thisArg, DebuggeeValue);
    assertSignatures(arguments, DebuggeeValue);
  }

  get onStep(){
    return this.@onStep;
  }

  set onStep(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onStep) {
      this.@onStep = value;
      this.@setHandler('onStep', value);
    }
  }

  get onPop(){
    return this.@onPop;
  }

  set onPop(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onPop) {
      this.@onPop = value;
      this.@setHandler('onPop', value);
    }
  }

  get onResume(){
    return this.@onResume;
  }

  set onResume(value){
    assertSignature(value, Undefined, Function);
    if (value !== this.@onResume) {
      this.@onResume = value;
      this.@setHandler('onResume', value);
    }
  }

  get type(){
    return $$Get()
  }

  get this(){
  }

  get older(){
  }

  get depth(){
  }

  get live(){
  }

  get script(){
  }

  get offset(){
  }

  get environment(){
  }

  get callee(){
  }

  get generator(){
  }

  get constructing(){
  }
};

const DebuggerScript = Debugger.Script = class Script {
  decompile(pretty){
    assertSignature(pretty, Undefined, Boolean);
  }

  getAllOffsets(){
  }

  getLineOffsets(line){
    assertSignature(line, Number);
  }

  getOffsetLine(offset){
    assertSignature(offset, Number);
  }

  getChildScripts(){
  }

  setBreakpoint(offset, handler){
    assertSignature(offset, Number);
    assertSignature(handler, BreakpointHandler);
  }

  getBreakpoints(offset){
    assertSignature(offset, Undefined, Number);
  }

  clearBreakpoints(handler, offset){
    assertSignature(handler, BreakpointHandler);
    assertSignature(offset, Undefined, Number);
  }

  get url(){
  }

  get startLine(){
  }

  get lineCount(){
  }

  get staticLevel(){
  }
};

const DebuggerObject = Debugger.Object = class Object {
  getProperty(name) {
    assertSignature(name, String);
  }

  setProperty(name, value){
    assertSignature(name, String);
    assertSignature(value, DebuggeeValue);
  }

  getOwnPropertyDescriptor(name){
    assertSignature(name, String);
  }

  getOwnPropertyNames(){
  }

  defineProperty(name, attributes){
    assertSignature(name, String);
    assertSignature(attributes, Descriptor);
  }

  defineProperties(properties){
    assertSignature(properties, Object);
  }

  deleteProperty(name){
    assertSignature(name, String);
  }

  seal(){
  }

  freeze(){
  }

  preventExtensions(){
  }

  isSealed(){
  }

  isFrozen(){
  }

  isExtensible(){
  }

  copy(value){
    assertSignature(value, DebuggerObject);
  }

  create(prototype, properties){
    assertSignature(prototype, DebuggerObject, Null);
    assertSignature(properties, Undefined, Object);
  }

  makeDebuggeeValue(value){
  }

  decompile(pretty){
    assertSignature(pretty, Undefined, Boolean);
  }

  call(thisArg, ...arguments){
    assertSignature(thisArg, DebuggeeValue, AsConstructor);
    assertSignatures(arguments, DebuggeeValue);
  }

  apply(thisArg, arguments){
    assertSignature(thisArg, DebuggeeValue, AsConstructor);
    assertSignature(arguments, DebuggeeValue);
  }

  evalInGlobal(code){
    assertSignature(code, String);
  }

  evalInGlobalWithBindings(code, bindings){
    assertSignature(code, String);
    assertSignature(bindings, Object);
  }

  asEnvironment(){
  }

  setObjectWatchpoint(handler){
    assertSignature(handler, WatchpointHandler, Null);
  }

  clearObjectWatchpoint(){
  }

  setPropertyWatchpoint(name, handler){
    assertSignature(name, String);
    assertSignature(handler, WatchpointHandler, Null);
  }

  clearPropertyWatchpoint(name){
    assertSignature(name, String);
  }

  unwrap(){
  }

  get proto(){
  }

  get brand(){
  }

  get callable(){
  }

  get name(){
  }

  get displayName(){
  }

  get parameters(){
  }

  get script(){
  }

  get environment(){
  }

  get proxyHandler(){
  }

  get global(){
  }
};

const DebuggerEnvironment = Debugger.Environment = class Environment {
  names(){
  }

  getVariable(name){
    assertSignature(name, String);
  }

  setVariable(name, value){
    assertSignature(name, String);
    assertSignature(value, DebuggeeValue);
  }

  getVariableDescriptor(name){
    assertSignature(name, String);
  }

  defineVariable(name, descriptor){
    assertSignature(name, String);
    assertSignature(descriptor, Descriptor);
  }

  deleteVariable(name){
    assertSignature(name, String);
  }

  find(name){
    assertSignature(name, String);
  }

  eval(code){
    assertSignature(code, String);
  }

  evalWithBindings(code, bindings){
    assertSignature(code, String);
    assertSignature(bindings, Object);
  }

  get type(){
  }

  get parent(){
  }

  get object(){
  }

  get thisValue(){
  }
};
