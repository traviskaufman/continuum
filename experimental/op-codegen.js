function generateOp(name, body){
  return 'function '+name+'(){\n'+
         body+
         '  return cmds[++ip];\n'+
         '}\n';
}

function binaryOp(name, op){
  var body = checkCompletion('lhs', 'sp - 2') +
             checkCompletion('rhs', 'sp - 1') +
             '  stack[--sp] = lhs '+op+' rhs;\n';
  return generateOp(name, body);
}

function unaryOp(name, op){
  var body = checkCompletion('arg', 'sp - 1') +
             '  stack[sp - 1] = '+op+'arg;\n';
  return generateOp(name, body);
}

function typeOp(name, type){
  var body = checkCompletion('arg', 'sp - 1') +
             '  stack[sp - 1] = typeof arg === "'+type+'";\n';
  return generateOp(name, body);
}

function methodOp(name, method){
  var body = checkCompletion('lhs', 'sp - 2') +
             checkCompletion('rhs', 'sp - 1') +
             '  stack[--sp] = rhs.'+method+'(lhs);\n';
  return generateOp(name, body);
}


function checkCompletion(name, sp){
  return '  var '+name+' = stack['+sp+'];\n'+
         '  if ('+name+' && '+name+'.Completion) {\n'+
         '    if ('+name+'.Abrupt) {\n'+
         '      error = '+name+';\n'+
         '      return unwind;\n'+
         '    } else {\n'+
         '      stack['+sp+'] = '+name+' = '+name+'.value;\n'+
         '    }\n'+
         '  }\n';
}


var code = [
  methodOp('INSTANCE_OF', 'HasInstance'),
  methodOp('IN', 'HasProperty'),
  unaryOp('VOID',      'void '),
  unaryOp('TO_NUMBER', '+'),
  unaryOp('NEGATE',    '-'),
  unaryOp('BIT_NOT',   '~'),
  unaryOp('NOT',       '!'),
  typeOp('IS_BOOLEAN',   'boolean'),
  typeOp('IS_NUMBER',    'number'),
  typeOp('IS_STRING',    'string'),
  typeOp('IS_UNDEFINED', 'undefined'),
  binaryOp('EQ',          '=='),
  binaryOp('NEQ',         '!='),
  binaryOp('STRICT_EQ',   '==='),
  binaryOp('STRICT_NEQ',  '!=='),
  binaryOp('LT',          '<'),
  binaryOp('GT',          '>'),
  binaryOp('LTE',         '<='),
  binaryOp('GTE',         '>='),
  binaryOp('MUL',         '*'),
  binaryOp('DIV',         '/'),
  binaryOp('MOD',         '%'),
  binaryOp('ADD',         '+'),
  binaryOp('CONCAT',      '+ "" +'),
  binaryOp('SUB',         '-'),
  binaryOp('SHL',         '<<'),
  binaryOp('SHR',         '>>'),
  binaryOp('SAR',         '>>>'),
  binaryOp('BIT_OR',      '|'),
  binaryOp('BIT_AND',     '&'),
  binaryOp('BIT_XOR',     '^'),
].join('\n');


console.log(code);
