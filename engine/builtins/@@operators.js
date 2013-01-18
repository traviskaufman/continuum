import {
  POSITIVE_INFINITY,
  NEGATIVE_INFINITY
} from '@@constants';

import {
  GetMethod,
  IsCallable,
  OrdinaryHasInstance,
  ToNumber,
  ToPrimitive
} from '@@operations';

import {
  Type
} from '@@types';

import {
  call,
  isNaN
} from '@@utilities';

import {
  $$Compare,
  $$Exception
} from '@@internals';

import {
  @@hasInstance: hasInstance
} from '@@symbols';




// ###############################
// ## 12.8 Relational Operators ##
// ###############################

// #######################################################
// # 12.8.1 The Abstract Relational Comparison Algorithm #
// #######################################################

function AbstractRelationalComparison(x, y, LeftFirst = true){
  let px, py;

  if (LeftFirst) {
    px = ToPrimitive(x, 'Number');
    py = ToPrimitive(y, 'Number');
  } else {
    py = ToPrimitive(y, 'Number');
    px = ToPrimitive(x, 'Number');
  }

  if (Type(px) === 'String' && Type(py) === 'String') {
    // TODO: full string relational comparison
    return $$Compare(px, py);
  }

  const nx = ToNumber(px),
        ny = ToNumber(py);

  if (isNaN(nx) || isNaN(ny)) {
    return undefined;
  } else if (nx === ny) {
    return false;
  } else if (nx === POSITIVE_INFINITY) {
    return false;
  } else if (ny === POSITIVE_INFINITY) {
    return true;
  } else if (ny === NEGATIVE_INFINITY) {
    return false;
  } else if (nx === NEGATIVE_INFINITY) {
    return true;
  }

  return $$Compare(nx, ny);
}


function INSTANCE_OF(lref, rref){
  return instanceofOperator(GetValue(lref), GetValue(rref));
}

function instanceofOperator(O, C){
  const instOfHandler = GetMethod(C, @@hasInstance);

  if (instOfHandler !== undefined) {
    return call(instOfHandler, C, [O]);
  }

  if (!IsCallable(C)) {
    throw $$Exception('instanceof_function_expected', [Type(C)]);
  }

  return OrdinaryHasInstance(C, O);
}
