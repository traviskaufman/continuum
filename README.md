# Continuum - A JavaScript Virtual Machine Built in JavaScript

Continuum is a JavaScript virtual machine built in JavaScript. It assembles bytecode from sourcecode and executes it an ES6 runtime environment. The code of the VM is written in ES3 level JavaScript, which means it can run in browsers as old as IE6. (though currently it's only regularly tested in IE8+ and there's probably some kinks to work out in older IE's).

*ES6 is an incomplete and still changing draft*

# Compatibility
Continuum probably works in every modern engine, but has not been tested.

Currently known to work in:

* IE8+
* Chrome 23+
* Firefox 15+
* Opera 12+

Usually works in but sometimes doesn't (the debugger interface doesn't work, but the engine can):

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

# Documentation

[docs](continuum/tree/gh-pages/docs)


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


# Todo

* IE6/7 stability
* Pass test262 (at least get to the point of only failing specific tests on purpose)
* Stabailize experimental DOM interface
* Resumable state from the serializer output
* Full dev environment built around Continuum
* Create a tracing meta-interpreter to run the interpreter/runtime
    * Garbage Collector
    * Tracing JIT "compiler" that targets host engine's JIT compiler
    * Refactor the runtime to compile efficiently
