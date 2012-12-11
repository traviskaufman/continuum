var fs = require('fs'),
    path = require('path');



function dir(name){
  return fs.readdirSync(name).sort().map(function(file){
    return name + '/' + file;
  });
}

function read(file){
  return fs.readFileSync(file, 'utf8')
}

function write(file, content){
  fs.writeFileSync(file, content);
}

function escapeJS(source){
  return '"' + source.replace(/\\/g, '\\\\').replace(/(?!=\\)\r?\n/g, '\\n').replace(/"/g, '\\"') + '"';
}

function transformer(files, callback){
  return files.map(function(file){
    var name = path.basename(file).slice(0, -path.extname(file).length);
    return callback(name, read(file));
  });
}

function Builder(){
  this.source = [];
}

Builder.prototype.addSource = function addSource(code){
  if (code instanceof Array) {
    [].push.apply(this.source, code);
  } else {
    this.source.push(code);
  }
};

Builder.prototype.addFiles = function addFiles(names, callback){
  if (!(names instanceof Array)) {
    names = [names];
  }
  if (callback) {
    this.addSource(transformer(names, callback));
  } else {
    this.addSource(names.map(read));
  }
};

Builder.prototype.addDirectory = function addDirectory(name, callback){
  if (callback) {
    this.addSource(transformer(dir(name), callback));
  } else {
    this.addSource(dir(name).map(read));
  }
};

Builder.prototype.combine = function combine(){
  return this.source.join('\n\n');
};

Builder.prototype.writeFile = function writeFile(name, minified){
  var src = this.combine();
  write(name+'.js', src);
  if (minified) {
    try {
      src = minify(src);
    } catch (e) {
      console.warn('You tried to make the minified version but likely are missing the'+
                   ' super duper custom things needed to make it, skipping minification');
    }
  }

  write(name+'.min.js', src);
}


var builder = new Builder;

builder.addFiles('./header.js');

builder.addFiles('../third_party/esprima/esprima.js', function(name, source){
  return 'exports.'+name+' = (function(exports){\n'+source+'\nreturn exports;\n})({});';
});

builder.addFiles([
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

  '../engine/object-model/natives.js',
  '../engine/constants.js',
  '../engine/errors.js',
  '../engine/assembler.js',

  '../engine/object-model/collections.js',
  '../engine/object-model/operators.js',
  '../engine/object-model/environments.js',
  '../engine/object-model/operations.js',
  '../engine/object-model/descriptors.js',
  '../engine/object-model/$Object.js',
  '../engine/object-model/$Array.js',
  '../engine/object-model/$Proxy.js',

  '../engine/thunk.js',
  '../engine/runtime.js',
  '../engine/debug.js',
  '../engine/index.js',
], function(name, source){
  return 'exports.'+source.slice(4);
});


builder.addDirectory('../engine/builtins', function(name, source){
  return name === 'index' ? '' : 'exports.builtins["'+name+'"] = '+escapeJS(source) + ';';
});


builder.addFiles('./footer.js');

var esprima, esmangle, escodegen, passes, post;

function minify(src){
  esprima = esprima || require('esprima');
  escodegen = escodegen || require('escodegen');
  esmangle = esmangle || require('esmangle');
  passes = passes || [
    esmangle.require('lib/pass/transform-dynamic-to-static-property-access'),
    esmangle.require('lib/pass/reordering-function-declarations'),
    esmangle.require('lib/pass/remove-unused-label'),
    esmangle.require('lib/pass/remove-empty-statement'),
    esmangle.require('lib/pass/remove-wasted-blocks'),
    esmangle.require('lib/pass/transform-to-compound-assignment'),
    esmangle.require('lib/pass/transform-to-sequence-expression'),
    esmangle.require('lib/pass/transform-branch-to-expression'),
    esmangle.require('lib/pass/reduce-sequence-expression'),
    esmangle.require('lib/pass/reduce-branch-jump'),
    esmangle.require('lib/pass/reduce-multiple-if-statements'),
    esmangle.require('lib/pass/dead-code-elimination')
  ];
  post = post || [
    esmangle.require('lib/post/transform-static-to-dynamic-property-access'),
    esmangle.require('lib/post/rewrite-boolean'),
    esmangle.require('lib/post/rewrite-conditional-expression')
  ];

  function passer(node, pass){ return pass(node) }

  var a = { loc: true },
      b = { destructive: true },
      c = {
        comment: false,
        allowUnparenthesizedNew: true,
        format: {
          indent: {
            style: '  ',
            base: 0,
            adjustMultilineComment: false
          },
          json: false,
          renumber: true,
          hexadecimal: true,
          quotes: 'single',
          escapeless: false,
          compact: true,
          parentheses: true,
          semicolons: true,
          safeConcatenation: true
        }
      },
      parse = esprima.parse,
      mangle = esmangle.mangle,
      optimize = esmangle.optimize,
      generate = escodegen.generate;

  return generate(mangle(post.reduce(passer, optimize(parse(src, a), passes, b)), b), c);
}

//builder.writeFile('../continuum');
builder.writeFile('../continuum', true);
