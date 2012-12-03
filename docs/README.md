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


### Classes

* [Assembler](continuum/docs/Assembler.md)
* [Code](continuum/docs/Code.md)
* [Exotics](continuum/docs/Exotics.md)
* [Realm](continuum/docs/Realm.md)
* [Renderer](continuum/docs/Renderer.md)
* [Script](continuum/docs/Script.md)
