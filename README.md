# Continuum - A JavaScript Virtual Machine Built in JavaScript

Continuum is a JavaScript virtual machine built in JavaScript. It assembles bytecode from sourcecode and executes it in an ES6 runtime environment. The code of the VM is written in ES3, which means it can run in browsers as old as IE6 (though currently it's only regularly tested in IE8+ and there's probably some kinks to work out in older IE's).

*ES6 is an incomplete and still changing draft*

# Compatibility
Continuum should work in every modern engine, but has not been tested.

Currently known to work in:

* IE8+
* Chrome 23+
* Firefox 15+
* Opera 12+
* Safari 5+

Usually works in but sometimes doesn't (the debugger interface doesn't work, but the engine can):

* IE6-7

![screenshot](https://raw.github.com/Benvie/continuum/gh-pages/docs/screenshot.png)

# Installation
In the browser, use the combined continuum.js or continuum.min.js. In Node.js:

    npm install continuum


# Quickstart Usage Overview
In the browser an object named `continuum` is added to the window, or in node `continuum` is the object returned by `require('continuum')`.

Basic usage of continuum is can be treated like using `eval` in an iframe or Node.js's `vm.runInContext`. In ES6 a "Realm" is basically the container for a global context. A Realm has a 'global' property (which is its global object), and a number of properties that are specific to each Realm instance, such as the set of intrinsic builtin objects like `Array`, `Function`, `Object`, etc.

    var realm = continuum.createRealm();

    var $array = realm.evaluate('[5, 10, 15, 20]');

    // you can use the ES internal functions to directly interact with objects
    console.log($array.Get(0)) // 5
    console.log($array.Get('map')) // $Function object

    // these two lines have the same result
    var $Function = realm.evaluate('Function');
    var $Function = realm.global.Get('Function');

    // like eval, code starts out executing in global scope
    realm.evaluate('var x = 500');
    console.log(realm.evaluate('x')); // 500

    // if your code uses the module system then it must be run asynchronously
    realm.evaluateAsync('module F = "@function"; F', function(result){
      console.log(result) // $Module { Function, call, apply, bind }
    });


## [Documentation](continuum/tree/gh-pages/docs/index.md)

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
* Generators
* Proxy and Reflect
* Symbols with syntactic @name support
* Typed Arrays
* Object.observe (es-next/es7)
* Default parameters
* Tail call optimization
* Array Comprehensions (partial implementation)

### Not Yet Implemented

* Generator Expressions
* Binary data api (structs, etc.)


# Todo

* IE6/7 stability
* Pass test262 (at least get to the point of only failing specific tests on purpose)
* Stabailize experimental DOM interface
* Resumable state from the serializer output
* Full dev environment built around Continuum
* Create a tracing meta-interpreter to run the interpreter/runtime (see [PyPy](http://pypy.org))
    * Garbage Collector
    * Tracing JIT "compiler" that targets host engine's JIT compiler
    * Refactor the runtime to compile efficiently (see [PyPy Coding Guide](http://doc.pypy.org/en/latest/coding-guide.html))
