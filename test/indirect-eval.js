var global = this,
    failures = {};

{
  function test(type, expression) {
    var uid = '_' + String(Math.random()).slice(2),
        code = expression.replace('...', 'var ' + uid + ' = 123');
    try {
      eval(code);
      var result = global[uid] === 123 ? 'indirect' : 'direct';
      if (type !== result) {
        failures[expression] = 'expected '+type+', got '+result;
      }
    } catch (err) {
      failures[expression] = err;
    }
    delete global[uid];
  }

  function direct(code){
    test('direct', code);
  }
  function indirect(code){
    test('indirect', code);
  }

  indirect("(1, eval)('...')");
  indirect("(eval, eval)('...')");
  indirect("(1 ? eval : 0)('...')");
  indirect("(0 || eval)('...')");
  indirect("(__ = eval)('...')")
  indirect("var e = eval; e('...')");
  indirect("(function(e) { return e('...') })(eval)");
  indirect("(function(e) { return e })(eval)('...')");
  indirect("(function() { arguments[0]('...') })(eval)");
  indirect("this.eval('...')");
  indirect("this['eval']('...')");
  indirect("global.eval('...')");
  indirect("global.global.eval('...')");
  indirect("[eval][0]('...')");
  indirect("({ eval: eval }).eval('...')");
  indirect("eval.call(this, '...')");
  indirect("eval.call({ }, '...')");
  indirect("eval.apply(this, ['...'])");
  indirect("eval('eval')('...')");
  indirect("(eval = eval)('...')");
  indirect('with({ e: eval }) e("...")');
  indirect('var o = { eval: eval }; o.eval("...")');

  direct("eval('...')");
  direct("(eval)('...')");
  direct("(((eval)))('...')");
  direct("(function(){ return eval('...') })()");
  direct("eval('eval(\"...\")')");
  direct("(function(eval){ return eval('...'); })(eval)");
  direct('with({ eval: eval }) eval("...")');
  direct('with(global) eval("...")');
  direct("Function('return eval(\"...\")')()");
  direct('with(global) eval("...")');
}
