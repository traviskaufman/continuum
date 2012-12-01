# Continuum - A JavaScript Virtual Machine Built in JavaScript

Continuum is a JavaScript virtual machine built in JavaScript. It assembles bytecode from sourcecode and executes it an ES6 runtime environment. The code of the VM is written in ES3 level JavaScript, which means it can run in browsers as old as IE6. (though currently it's only regularly tested in IE8+ and there's probably some kinks to work out in older IE's).

*ES6 is still an unfinished specification and is still a moving target*

# Compatibility
Continuum probably works in every modern engine, but has not been tested.

Currently known to work in:

* IE8+
* Chrome 23+
* Firefox 15+
* Opera 12+

Will soon work in:

* IE6-7

![screenshot](https://raw.github.com/Benvie/continuum/gh-pages/docs/screenshot.png)

# Installation
In the browser, use the combined continuum.js or continuum.min.js. In node

    npm install continuum


# Quickstart Usage Overview
In the browser an object named `continuum` is added to the window, or in node it's the object returned by `require('continuum')`.

Usage of continuum is quite simple and can basically be treated like using `eval` in iframe or node's `vm.runInContext`. Supply the code, get the result. In ES6 a "Realm" is basically the container for a context. A Realm has a 'global' property which is its global object, and a number of properties that specific to each Realm instance, such as the list of builtins like Array, Function, Object, etc.

    var realm = continuum.createRealm();

    var $array = realm.evaluate('[5, 10, 15, 20]');

    // you can use the ES internal functions to directly interact with objects
    console.log($array.Get(0)) // 5
    console.log($array.Get('map')) // $Function object

    // these two lines have the same result
    var $Function = realm.evaluate('Function');
    var $Function = realm.global.Get('Function');

    // if your code uses the module system then it must be run asynchronously
    realm.evaluateAsync('module F = "@function"; F', function(result){
      console.log(result) // $Module { Function, call, apply, bind }
    });

# ES6 Implementation Status

### Implemented

* destructuring assignment and arguments
* spread in arguments and array initializers
* rest parameters
* classes and super
* arrow functions
* block scope
* new Math functions
* new Object functions
* new String functions
* concise methods in object literals
* mutable and deletable __proto__
* Map, Set, and WeakMap (garbage collection semantics not fully realized)
* Iterators and for...of
* Templates
* Module system with imports and exports
* builtin '@std' modules `module std = '@std'` or `import call from '@function'`
* Generators (kind of broken at the moment though)
* Proxy and Reflect (also buggy)
* Symbols with syntactic @name support
* Typed Arrays
* Object.observe (es-next/es7)

### Soon to be Implemented

* Array Comprehensions
* Default parameters
* Tail call optimization
* Binary data api (structs, etc.)


# API Overview

### Core API

* __createRealm()__
    Creates a new realm (context + global object).
* __createRealmAsync()__
    Ensures the realm will initializer after a tick (useful because initialization can lock the engine up for a second while it runs executes the initialization code for all the builtins)
* __createScript(code|filename)__
    Creates a Script object which can be executed.
* __createCode(code|filename)__
    Creates bytecode from the given source and returns it unexecuted (this will be serializable to disk soon).
* __createRenderer(handlers)__
    For debug rendering, like the debugger UI.
* __createFunction(func)__
    Wraps a regular function as a function object that can be used inside the VM.
* __introspect($object)__
    Return a debug Mirror object that wraps any type of VM object, primitive, or scope object. This provides an easy to use and normalized interface for querying information about objects.
* __brainTransplant(target, replacement)__
    This modifies a VM function object so that your provided callback function is executed instead of the original code in the function. This change is made without modifying the function in any other way, so you're basically taking it over like a body snatcher.
* __createExotic(definition)__
    An interface that exposes a similar API as the Proxy API in ES6, but at a lower level. By implementing a small set of basic handlers, you can create object types with custom semantics easily that still act like "normal" objects.

### Extras

* __utility__
    Contains a substantial amount of useful functionality used in continuum and generally useful in any JS.
* __constants__
    All of the large amount of constants and symbols used by the VM.
* __iterate__
    A utility function that exposes custom iterators in ES6 style (StopIteration, next, etc.). Most of the data structures used in continuum define custom iterators that work with this.

# API Classes In Depth

## Realm

A Realm is the main thing you interact with. Each realm has a global object with a unique set of builtin globals. A realm is roughly equivalent to an iframe or a node vm context.

* __realm.evaluate(code)__
    Executes code in the virtual machine and returns the completion value, if any. "code" can be a string or an already compiled Script object. If a string is provided, a new Script will be created and added to realm.scripts.
* __realm.evaluateAsync(code, callback, [errback])__
    Primarily for when executing code that uses the module system, which must be run asynchronously if importing remote resources.


### State Events

A realm is an Event Emitter and events can be listened to by using `realm.on('event', callback)`. There's also `realm.off` to remove listeners and `realm.once` to only get a single event notification.


The following events are emitted by the VM to indicate changes to the state of execution and provide access to information about related objects.

* __'complete'__ *result*
    emitted whenever a script completes execution. The result value is the same value that's returned from realm.evaluate.
* __'executing'__ *thunk*
    emitted whenever execution begins or resume. The thunk is the object which executes the bytecode.
* __'throw'__ *exception*
    throw is emitted on uncaught exception. The thrown object (usually an $Error) will be passed to the callback.
* __'pause'__ *resume*
    pause is emitted when a `debugger` statement is encountered. A function which will resume execution is passed to the callback, and is also available as `realm.resume`.
* __'resume'__
    emitted when the resume function provided from the __pause__ event is called and execution begins again.
* __'op'__ *operation*
    emitted every time an opcode is executed. Be very careful when listening to this event. A small to medium sized chunk of code can emit hundreds of thousands or millions of ops in a very short amount of time.

### API Events

The following events are emitted by functions from inside the VM to simulate things like input/output and require some implementation on your part to do anything useful.

* __'write'__ *text*, *color*
    emitted by __stdout.write__, which is used by __console.log__ and friends.
* __'clear'__
    emitted by __stdout.clear__ to provide a way to clear whatever it is you're providing as stdout
* __'backspace' *number*
    emitted by __stdout.backspace__ to provide a way to delete a specific amount of characters from the end.


## Renderer

A Renderer is a visitor used to introspect VM objects and values.

*...TODO docs...*

## Assembler

An Assembler is used to convert AST into bytecode and static script information.

*...TODO docs...*

## Script

A Script object contains all the static information about a chunk of code: the given options, original source, AST, bytecode, and the compiled thunk that executes the bytecode. Scripts don't contain runtime information so they are portable between realms and can be executed multiple times. When using `realm.evaluate` or `realm.evaluateAsync` with a Script, it can be executed directly without compiling again.

*...TODO docs...*

## Code

A Code object contains the compiled bytecode of a Script. It also contains most of the static semantics derived from the source such as bound names, declarations, imports/exports, etc. In the short term future it is planned for Code objects to be serializable to a portable form such that code can be compiled once and then redistributed and executed in this form.

*...TODO docs...*

## Exotic Objects

All of the higher level functions like `DefineOwnProperty`, `GetOwnProperty`, `GetP`, `Enumerate`, `Call`, etc. have many semantics in them that are hard to replicate if you try to replace those functions wholesale with your own implementation. Below these specification functions, continuum uses a simple API that all Object property access and execution eventually goes through. A call to `obj.GetOwnProperty` will ultimately result in calls to `obj.describe(key)`, `obj.set(key, value)`, and `obj.update(key, attribute)`. These low level functions are responsible for the actual storage and retrieval of the data, once all the preprocessing has been completed by the runtime. To make an exotic object, you can use Continuum's API to make an object with custom callbacks for these low levels functions, making it easy to override and extend.

Below is all most of the functions you can override, and their default implementation. A customized object could either skip some/most of these, could implement completely custom behavior, or could simply augment the normal functionality with some slightly altered behavior

```javascript
var $MyObjectType = continuum.createExotic('Object', [
  // delete a property
  function remove(key){
    return this.properties.remove(key);
  },
  function describe(key){
    // properties are stored as arrays with 3 fields [key, value, attributes]
    // describe is a request for one of these property arrays
    return this.properties.getProperty(key);
  },
  function define(key, value, attrs){
    // define sets both the value and the attributes at the same time
    return this.properties.set(key, value, attrs);
  },
  function has(key){
    // hasOwnProperty
    return this.properties.has(key);
  },
  function each(callback){
    // `each` is the only way the API exposes to get a list of all the properties
    this.properties.forEach(callback, this);
  },
  function get(key){
    // retrieve value
    return this.properties.get(key);
  },
  function set(key, value){
    // store value, using default attributes if property is new
    return this.properties.set(key, value);
  },
  function query(key){
    // retrieve attributes
    return this.properties.getAttribute(key);
  },
  function update(key, attr){
    // store attributes
    return this.properties.setAttribute(key, attr);
  }
]);
```

# Todo

* Pass test262 (at least get to the point of only failing specific tests on purpose)
* External interface to the DOM/Node.js
* Serializable bytecode
* Full dev environment built around Continuum
* Bootstrap the runtime by compiling it to bytecode and self-executing
* Massive work on optimizations
* IE6/7
