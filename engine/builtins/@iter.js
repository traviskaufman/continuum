export const iterator = @iterator;

export class Iterator {
  @iterator(){
    return this;
  }
}

builtinClass(Iterator);


export function keys(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        if (obj.@@has(x)) {
          yield x;
        }
      }
    })()
  };
}

builtinFunction(keys);


export function values(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        if (obj.@@has(x)) {
          yield obj[x];
        }
      }
    })()
  };
}

builtinFunction(values);


export function entries(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        if (obj.@@has(x)) {
          yield [x, obj[x]];
        }
      }
    })()
  };
}

builtinFunction(entries);


export function allKeys(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        yield x;
      }
    })()
  };
}

builtinFunction(allKeys);


export function allValues(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        yield obj[x];
      }
    })()
  };
}

builtinFunction(allValues);


export function allEntries(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        yield [x, obj[x]];
      }
    })()
  };
}

builtinFunction(allEntries);
