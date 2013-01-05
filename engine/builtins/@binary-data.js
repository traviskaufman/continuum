import {
  $$Set
} from '@@internals';

import {
  define
} from '@@utilities';

class Type {}

define(Type, @@toStringTag, 'DataType');
$$Set(Type, 'BuiltinBrand', 'BuiltinDataType');

define(Type.prototype, @@toStringTag, 'Data');
$$Set(Type.prototype, 'BuiltinBrand', 'BuiltinData');

class ArrayType extends Type {}
class StructType extends Type {}
