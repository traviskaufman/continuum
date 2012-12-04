private @toString, @valueOf;

export class Date {
  constructor(...values){
    return $__DateCreate(...values);
  }

  toString(){
    if (this && this.@@GetBuiltinBrand() === 'BuiltinDate') {
      return this.@@toString();
    } else {
      throw $__Exception('not_generic', ['Date.prototype.toString']);
    }
  }

  valueOf(){
    if (this && this.@@GetBuiltinBrand() === 'BuiltinDate') {
      return this.@@valueOf();
    } else {
      throw $__Exception('not_generic', ['Date.prototype.valueOf']);
    }
  }
}

builtinClass(Date);

Date.prototype.@@extend({
  @toString: $__DateToString,
  @valueOf: $__DateToNumber
});

$__wrapDateMethods(Date.prototype);


export let now = $__now;
Date.@@extend({ now });

