
function PropertyDescriptor(attrs){
  this.attrs = attrs * 4;
}

void function(t, fields){
  _f += ''; set_f += ''; is_f += ''; to_f += '';

  for (var i = 0, j = 0; i < 4; i++) {
    for (var k = i * 4; k < i * 4 + 4; k++) {
      t[j++] = (k & 1) > 0;
      t[j++] = (k & 2) > 0;
      t[j++] = (k & 4) > 0;
      t[j++] = (k & 8) > 0;
    }
    define(i);
  }

  function make(src, f, o, m){
    return new Function('t', 'return '+src.replace(/_f/g, f).replace(/_o/g, o).replace(/_m/g, m))(t);
  }

  function define(o){
    var f = fields[o],
        m = (1 << o) * 4;
    o = -o;

    PropertyDescriptor.prototype[f] = make(_f, f, o, m);
    PropertyDescriptor.prototype['set'+f] = make(set_f, f, o, m);
    PropertyDescriptor['is'+f] = make(is_f, f, o, m);
    PropertyDescriptor['to'+f] = make(to_f, f, o, m);
  }

  function _f(){
    return t[this.attrs - _o];
  }

  function set_f(enable){
    if (t[this.attrs - _o] === !enable) {
      this.attrs -= enable ? -_m : _m;
    }
  }

  function is_f(attrs){
    attrs >>>= 0;
    return t[attrs - _o];
  }

  function to_f(attrs, enable){
    attrs >>>= 0;
    return t[attrs - _o] === !enable ? attrs - (enable ? -_m : _m) : attrs;
  }
}([], ['Enumerable', 'Configurable', 'Writable', 'Accessor']);


var isEnumerable   = PropertyDescriptor.isEnumerable,
    isConfigurable = PropertyDescriptor.isConfigurable,
    isWritable     = PropertyDescriptor.isWritable,
    isAccessor     = PropertyDescriptor.isAccessor;

