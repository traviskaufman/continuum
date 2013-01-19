import {
  builtinClass,
  builtinFunction
} from '@@utilities';

import {
  @@iterator: iterator
} from '@@symbols';

import {
  ToObject
} from '@@operations';


export const iterator = @@iterator;


export function zip(a, b){
  const keys = a.@@iterator(),
        vals = b.@@iterator();

  return (function*(){
    while (true) {
      yield [keys.next(), vals.next()];
    }
  })();
}

builtinFunction(zip);


export function unzip(iterable){
  const obj = ToObject(iterable);

  if ('values' in obj) {
    const keys = 'keys' in obj ? obj.keys() : obj.values(),
          vals = obj.values();

    return [ (function*(){ while (1) yield keys.next() })(),
             (function*(){ while (1) yield vals.next() })() ];
  }

  let key = 'entries' in obj ? 'entries' : @@iterator in obj ? @@iterator : null;
  if (key) {
    const keys = obj[key](),
          vals = obj[key]();

    return [ (function*(){ while (1) yield keys.next()[0] })(),
             (function*(){ while (1) yield vals.next()[1] })() ];
  }
}

builtinFunction(unzip);


export class Iterator {
  @@iterator(){
    return this;
  }
}

builtinClass(Iterator);

export const StopIteration = $__StopIteration;
