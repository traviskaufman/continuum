export let iterator = @iterator;

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

export function items(obj){
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

builtinFunction(items);

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

export function allItems(obj){
  return {
    @iterator: ()=> (function*(){
      for (let x in obj) {
        yield [x, obj[x]];
      }
    })()
  };
}

builtinFunction(allItems);
