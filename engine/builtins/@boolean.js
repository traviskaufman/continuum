export class Boolean {
  constructor(value){
    if (!$__IsConstructCall()) {
      return $__ToBoolean(value);
    }
    $__SetBuiltinBrand(this, 'BooleanWrapper');
    this.@@BooleanValue = $__ToBoolean(value);
  }

  toString(){
    let type = $__Type(this);
    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && $__GetBuiltinBrand(this) === 'Boolean') {
      return this.@@BooleanValue ? 'true' : 'false';
    } else {
      throw $__Exception('not_generic', ['Boolean.prototype.toString']);
    }
  }

  valueOf(){
    let type = $__Type(this);
    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && $__GetBuiltinBrand(this) === 'Boolean') {
      return this.@@BooleanValue;
    } else {
      throw $__Exception('not_generic', ['Boolean.prototype.valueOf']);
    }
  }
}

builtinClass(Boolean);
