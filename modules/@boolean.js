export class Boolean {
  constructor(value){
    value = $__ToBoolean(value);
    return $__IsConstructCall() ? $__BooleanCreate(value) : value;
  }

  toString(){
    var type = $__Type(this);
    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && this.@@GetBuiltinBrand() === 'Boolean') {
      return this.@@PrimitiveValue ? 'true' : 'false';
    } else {
      throw $__Exception('not_generic', ['Boolean.prototype.toString']);
    }
  }

  valueOf(){
    var type = $__Type(this);
    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && this.@@GetBuiltinBrand() === 'Boolean') {
      return this.@@PrimitiveValue;
    } else {
      throw $__Exception('not_generic', ['Boolean.prototype.valueOf']);
    }
  }
}

builtinClass(Boolean);

Boolean.prototype.@@DefineOwnProperty(@@PrimitiveValue, {
  configurable: true,
  enumerable: false,
  get: $__GetPrimitiveValue,
  set: $__SetPrimitiveValue
});
