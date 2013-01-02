export class Boolean {
  constructor(value){
    value = $__ToBoolean(value);
    return $__isConstruct() ? $__BooleanCreate(value) : value;
  }

  toString(){
    let type = $__Type(this);
    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && $__GetBuiltinBrand(this) === 'BooleanWrapper') {
      return this.@@BooleanValue ? 'true' : 'false';
    } else {
      throw $__Exception('not_generic', ['Boolean.prototype.toString']);
    }
  }

  valueOf(){
    let type = $__Type(this);
    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && $__GetBuiltinBrand(this) === 'BooleanWrapper') {
      return this.@@BooleanValue;
    } else {
      throw $__Exception('not_generic', ['Boolean.prototype.valueOf']);
    }
  }
}

builtinClass(Boolean);

$__define(Boolean.prototype, @@BooleanValue, false);
