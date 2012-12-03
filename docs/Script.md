## Script

A Script object contains all the static information about a chunk of code: the given options, original source, AST, bytecode, and the compiled thunk that executes the bytecode. Scripts don't contain runtime information so they are portable between realms and can be executed multiple times. When using `realm.evaluate` or `realm.evaluateAsync` with a Script, it can be executed directly without compiling again.

*...TODO docs...*
