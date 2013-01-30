var minify = true;
//var minify = false;

require('./builder')

.create()

.addFiles('./header.js')

.addFiles([
  '../third_party/esprima/esprima.js'
], function(name, source){
  return 'exports.'+name+' = (function(exports){\n'+source+'\nreturn exports;\n})({});';
})

.addFiles([
  '../engine/lib/functions.js',
  '../engine/lib/objects.js',
  '../engine/lib/iteration.js',
  '../engine/lib/utility.js',
  '../engine/lib/Queue.js',
  '../engine/lib/traversal.js',
  '../engine/lib/Stack.js',
  '../engine/lib/LinkedList.js',
  '../engine/lib/DoublyLinkedList.js',
  '../engine/lib/HashMap.js',
  '../engine/lib/HashSet.js',
  '../engine/lib/ObjectMap.js',
  '../engine/lib/Emitter.js',
  '../engine/lib/Feeder.js',
  '../engine/lib/PropertyList.js',
  '../engine/lib/buffers.js',

  '../engine/engine.js',
  '../engine/constants.js',
  '../engine/errors.js',
  '../engine/assembler.js',

  '../engine/object-model/$Symbol.js',
  '../engine/object-model/$Nil.js',
  '../engine/object-model/descriptors.js',
  '../engine/object-model/collections.js',
  '../engine/object-model/operators.js',
  '../engine/object-model/environments.js',
  '../engine/object-model/operations.js',
  '../engine/object-model/$Object.js',
  '../engine/object-model/$Arguments.js',
  '../engine/object-model/$Array.js',
  '../engine/object-model/$Proxy.js',
  '../engine/object-model/$TypedArray.js',

  '../engine/natives.js',
  '../engine/thunk.js',
  '../engine/runtime.js',
  '../engine/debug.js',
  '../engine/index.js'
], function(name, source){
  return 'exports.'+source.slice(4);
})


.addDirectory('../engine/builtins', function(name, source){
  return name === 'index' ? '' : 'exports.builtins["'+name+'"] = '+escapeJS(source) + ';';
})


.addFiles('./footer.js')


.writeFile('../continuum', { minify: minify });




function escapeJS(source){
  return '"' + source.replace(/\\/g, '\\\\').replace(/(?!=\\)\r?\n/g, '\\n').replace(/"/g, '\\"') + '"';
}
