let ReplacerFunction, PropertyList, stack, indent, gap;

function J(value){
  if (stack.has(value)) {
    throw $__Exception('circular_structure', []);
  }

  const stepback = indent,
        partial = [];

  var brackets;

  indent += gap;
  stack.add(value);

  if ($__GetBuiltinBrand(value) === 'Array') {
    brackets = ['[', ']'];

    for (var i=0, len = value.length; i < len; i++) {
      var prop = Str(i, value);
      partial[i] = prop === undefined ? 'null' : prop;
    }
  } else {
    var keys = PropertyList || $__Enumerate(value, false, true),
        colon = gap ? ': ' : ':';

    brackets = ['{', '}'];

    for (var i=0, len=keys.length; i < len; i++) {
      var prop = Str(keys[i], value);
      if (prop !== undefined) {
        partial.push($__Quote(keys[i]) + colon + prop);
      }
    }
  }

  var final;
  if (!partial.length) {
    final = brackets[0] + brackets[1];
  } else if (!gap) {
    final = brackets[0] + partial.join(',') + brackets[1];
  } else {
    final = brackets[0] + '\n' + indent + partial.join(',\n' + indent) + '\n' + stepback + brackets[1];
  }
  stack.delete(value);
  indent = stepback;
  return final;
}

internalFunction(J);

function Str(key, holder){
  var value = holder[key];
  if ($__Type(value) === 'Object') {
    var toJSON = value.toJSON;
    if (typeof toJSON === 'function') {
      value = $__Call(toJSON, value, [key]);
    }
  }

  if (ReplacerFunction) {
    value = $__Call(ReplacerFunction, holder, [key, value]);
  }

  if ($__Type(value) === 'Object') {
    var brand = $__GetBuiltinBrand(value);
    if (brand === 'Number') {
      value = $__ToNumber(value);
    } else if (brand === 'String') {
      value = $__ToString(value);
    } else if (brand === 'Boolean') {
      value = value.@@BooleanValue;
    }
  }


  if (value === null) {
    return 'null';
  } else if (value === true) {
    return 'true';
  } else if (value === false) {
    return 'false';
  }

  var type = typeof value;
  if (type === 'string') {
    return $__Quote(value);
  } else if (type === 'number') {
    return value !== value || value === Infinity || value === -Infinity ? 'null' : '' + value;
  } else if (type === 'object') {
    return J(value);
  }

}

internalFunction(Str);

export function stringify(value, replacer, space){
  ReplacerFunction = undefined;
  PropertyList = undefined;
  stack = new Set;
  indent = '';

  if ($__Type(replacer) === 'Object') {
    if (typeof replacer === 'function') {
      ReplacerFunction = replacer;
    } else if ($__GetBuiltinBrand(replacer) === 'Array') {
      let props = new Set;

      for (let value of replacer) {
        var item,
            type = $__Type(value);

        if (type === 'String') {
          item = value;
        } else if (type === 'Number') {
          item = $__ToString(value);
        } else if (type === 'Object') {
          let brand = $__GetBuiltinBrand(value);
          if (brand === 'String' || brand === 'Number') {
            item = $__ToString(value);
          }
        }

        if (item !== undefined) {
          props.add(item);
        }
      }

      PropertyList = [...props];
    }
  }

  if ($__Type(space) === 'Object') {
    space = $__ToString(space);
  }

  if ($__Type(space) === 'String') {
    gap = $__StringSlice(space, 0, 10);
  } else if ($__Type(space) === 'Number') {
    space |= 0;
    space = space > 10 ? 10 : space < 1 ? 0 : space
    gap = ' '.repeat(space);
  } else {
    gap = '';
  }

  return Str('', { '': value });
}

export function parse(source, reviver){
  return $__JSONParse(source, reviver);
}



export let JSON = {};
extend(JSON, { stringify, parse });
$__SetBuiltinBrand(JSON, 'BuiltinJSON');
$__define(JSON, @@toStringTag, 'JSON');
