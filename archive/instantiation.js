
function FunctionDeclarationInstantiation(func, args, env){
  var formals = func.FormalParameters,
      params = formals.boundNames;

  for (var i=0; i < params.length; i++) {
    if (!env.HasBinding(params[i])) {
      env.CreateMutableBinding(params[i]);
      env.InitializeBinding(params[i], undefined);
    }
  }

  var decls = func.code.lexDecls;

  for (var i=0, decl; decl = decls[i]; i++) {
    var names = decl.boundNames;
    for (var j=0; j < names.length; j++) {
      if (!env.HasBinding(names[j])) {
        if (decl.IsConstantDeclaration) {
          env.CreateImmutableBinding(names[j]);
        } else {
          env.CreateMutableBinding(names[j], false);
        }
      }
    }
  }

  if (func.strict) {
    var ao = new $StrictArguments(args);
    var status = ArgumentBindingInitialization(formals, ao, env);
  } else {
    var ao = env.arguments = new $MappedArguments(args, env, params, func);
    var status = ArgumentBindingInitialization(formals, ao);
  }

  if (status && status.Abrupt) {
    return status;
  }

  if (!env.HasBinding('arguments')) {
    if (func.strict) {
      env.CreateImmutableBinding('arguments');
    } else {
      env.CreateMutableBinding('arguments');
    }
    env.InitializeBinding('arguments', ao);
  }


  var vardecls = func.code.varDecls;
  for (var i=0; i < vardecls.length; i++) {
    if (!env.HasBinding(vardecls[i])) {
      env.CreateMutableBinding(vardecls[i]);
      env.InitializeBinding(vardecls[i], undefined);
    }
  }

  var funcs = create(null);

  for (var i=0; i < decls.length; i++) {
    if (decls[i].type === 'FunctionDeclaration') {
      var decl = decls[i],
          name = decl.id.name;

      if (!(name in funcs)) {
        funcs[name] = true;
        env.InitializeBinding(name, InstantiateFunctionDeclaration(decl, env));
      }
    }
  }
}

function BlockDeclarationInstantiation(decls, env){
  for (var i=0, decl; decl = decls[i]; i++) {
    for (var j=0, name; name = decl.boundNames[j]; j++) {
      if (decl.IsConstantDeclaration) {
        env.CreateImmutableBinding(name);
      } else {
        env.CreateMutableBinding(name, false);
      }
    }
  }

  for (i=0; decl = decls[i]; i++) {
    if (decl.type === 'FunctionDeclaration') {
      env.InitializeBinding(decl.id.name, InstantiateFunctionDeclaration(decl, env));
    }
  }
}


function BindingInitialization(pattern, value, env){
  if (pattern.type === 'Identifier') {
    if (env) {
      env.InitializeBinding(pattern.name, value);
    } else {
      return PutValue(IdentifierResolution(context, pattern.name), value);
    }
  } else if (pattern.type === 'ArrayPattern') {
    return IndexedBindingInitialization(pattern, value, 0, env);
  } else if (pattern.type === 'ObjectPattern') {
    return ObjectBindingInitialization(pattern, value, env);
  }
}

function ArgumentBindingInitialization(params, args, env){
  for (var i = 0, arg; arg = params[i]; i++) {
    var value = args.HasProperty(i) ? args.Get(i) : undefined;
    if (value && value.Completion) {
      if (value.Abrupt) {
        return value;
      } else {
        value = value.value;
      }
    }
    BindingInitialization(arg, value, env);
  }
  if (params.Rest) {
    var len = args.get('length') - params.length,
        array = new $Array(0);

    if (len > 0) {
      for (var i=0; i < len; i++) {
        array.set(i, args.get(params.length + i));
      }
      array.define('length', len, 4);
    }
    BindingInitialization(params.Rest, array, env);
  }
}


function IndexedBindingInitialization(pattern, array, i, env){
  for (var element; element = pattern.elements[i]; i++) {
    if (element.type === 'SpreadElement') {
      var value = context.destructureSpread(array, i);
      if (value.Abrupt) {
        return value;
      }
      return BindingInitialization(element.argument, value, env);
    }

    var value = array.HasProperty(i) ? array.Get(i) : undefined;
    if (value && value.Completion) {
      if (value.Abrupt) {
        return value;
      } else {
        value = value.value;
      }
    }
    BindingInitialization(element, value, env);
  }
  return i;
}

function ObjectBindingInitialization(pattern, object, env){
  for (var i=0, property; property = pattern.properties[i]; i++) {
    var value = object.HasProperty(property.key.name) ? object.Get(property.key.name) : undefined;
    if (value && value.Abrupt) return value;
    BindingInitialization(property.value, value, env);
  }
}


function Call(){
  /* ... */
  ExecutionContext.push(new ExecutionContext(context, local, realm, this.code, this, args, isConstruct));
  var status = FunctionDeclarationInstantiation(this, args, local);
  if (status && status.Abrupt) {
    ExecutionContext.pop();
    return status;
  }
  /* ... */
}
