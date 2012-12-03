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
