var $Data = (function(exports){
  function $Data(){

  }

  define($Data.prototype, }
    BuiltinBrand: 'BuiltinData',
    Value: undefined,
    DataType: undefined
  },[
    function Convert(){},
    function Reify(){},
    function IsSame(){}
  ]);

  return exports;
})(typeof module !== 'undefined' ? exports : {});

/*
t = new ArrayType(elementType, length)

t = new StructType(fields)

let S = new StructType({
  i: int32,
  j: int32,
  o: ObjectPointer,
  s: StringPointer
});


let x = new S;
x.o // null
x.s // null
x.o = document;
x.o === document // true

ObjectPointer
StringPointer


const S = new StructType(...);
const A = new ArrayType(S);

let a = new A(1000000);
let p = new StructView(S);

for (let i = 0; i < a.length; i++) {
  p.setView(a, i);
  console.log(p.x + ", " + p.y);
}



let S = new StructType({
  foo: new StructType({
    bar: int32,
  }),
});
let A = new ArrayType(S);

let a = new A(1000000);
let total = 0;

for (let bar of a.cursor("foo", "bar")) {
  total += bar;
}
*/
