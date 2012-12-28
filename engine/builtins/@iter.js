export const iterator = @@iterator;

export class Iterator {
  @@iterator(){
    return this;
  }
}

builtinClass(Iterator);


export function keys(obj){
  obj = $__ToObject(obj);
  return (function*(){
    for (let x in obj) {
      if ($__has(obj, x)) {
        yield x;
      }
    }
  })();
}

builtinFunction(keys);


export function values(obj){
  obj = $__ToObject(obj);
  return (function*(){
    for (let x in obj) {
      if ($__has(obj, x)) {
        yield obj[x];
      }
    }
  })();
}

builtinFunction(values);


export function entries(obj){
  obj = $__ToObject(obj);
  return (function*(){
    for (let x in obj) {
      if ($__has(obj, x)) {
        yield [x, obj[x]];
      }
    }
  })();
}

builtinFunction(entries);


export function allKeys(obj){
  obj = $__ToObject(obj);
  return (function*(){
    for (let x in obj) {
      yield x;
    }
  })();
}

builtinFunction(allKeys);


export function allValues(obj){
  obj = $__ToObject(obj);
  return (function*(){
    for (let x in obj) {
      yield obj[x];
    }
  })();
}

builtinFunction(allValues);


export function allEntries(obj){
  obj = $__ToObject(obj);
  return (function*(){
    for (let x in obj) {
      yield [x, obj[x]];
    }
  })();
}

builtinFunction(allEntries);
