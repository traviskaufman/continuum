var errors = (function(errors, messages, exports){
  "use strict";
  var objects   = require('./lib/objects'),
      constants = require('./constants');

  var define    = objects.define,
      inherit   = objects.inherit;

  function Exception(name, type, message){
    var args = {},
        argNames = [],
        src = '';

    for (var i=0; i < message.length; i++) {
      var str = message[i];
      if (str[0] === '$') {
        if (!args.hasOwnProperty(str))
          argNames.push(str);
        src += '+'+str;
      } else {
        src += '+"'+str.replace(/["\\\n]/g, '\\$0')+'"';
      }
    }

    this.name = name;
    this.type = type;
    return new Function('e', 'return function '+name+'('+argNames.join(', ')+'){ return '+src.slice(1)+'; }')(this);
  }



  for (var name in messages) {
    for (var type in messages[name]) {
      errors[type] = new Exception(name, type, messages[name][type]);
    }
  }




  // ##################
  // ### Completion ###
  // ##################

  function Completion(type, value, target){
    this.type = type;
    this.value = value;
    this.target = target;
  }

  exports.Completion = Completion;

  define(Completion.prototype, {
    Completion: true
  });

  define(Completion.prototype, [
    function toString(){
      return this.value;
    },
    function valueOf(){
      return this.value;
    }
  ]);


  function AbruptCompletion(type, value, target){
    this.type = type;
    this.value = value;
    this.target = target;
  }

  inherit(AbruptCompletion, Completion, {
    Abrupt: true
  });

  exports.AbruptCompletion = AbruptCompletion;

  function $$MakeException(type, args){
    if (!(args instanceof Array)) {
      args = [args];
    }
    var error = errors[type];
    return exports.createError(error.name, type, error.apply(null, args));
  }

  exports.$$MakeException = $$MakeException;


  function $$ThrowException(type, args){
    return new AbruptCompletion('throw', $$MakeException(type, args));
  }

  exports.$$ThrowException = $$ThrowException;


  return exports;
})({}, {
  TypeError: {
    bad_argument                   : ["$0", " received a bad argument, expecting a ", "$1"],
    cyclic_proto                   : ["Cyclic __proto__ value"],
    incompatible_method_receiver   : ["Method ", "$0", " called on incompatible receiver ", "$1"],
    invalid_lhs_in_assignment      : ["Invalid left-hand side in assignment"],
    invalid_lhs_in_for_in          : ["Invalid left-hand side in for-in"],
    invalid_lhs_in_postfix_op      : ["Invalid left-hand side expression in postfix operation"],
    invalid_lhs_in_prefix_op       : ["Invalid left-hand side expression in prefix operation"],
    redeclaration                  : ["$0", " '", "$1", "' has already been declared"],
    uncaught_exception             : ["Uncaught ", "$0"],
    stack_trace                    : ["Stack Trace:\n", "$0"],
    called_non_callable            : ["$0", " is not a function"],
    property_not_function          : ["Property '", "$0", "' is not a function"],
    not_constructor                : ["$0", " is not a constructor"],
    construct_non_constructor      : ["Cannot construct non-function ", "$0"],
    cannot_convert_to_primitive    : ["Cannot convert object to primitive value"],
    cannot_convert_to_primitive2   : ["$0", " cannot convert object to primitive value"],
    with_expression                : ["$0", " has no properties"],
    illegal_invocation             : ["Illegal invocation"],
    invalid_in_operator_use        : ["Cannot use 'in' operator to search for '", "$0", "' in ", "$1"],
    instanceof_function_expected   : ["Expecting a function in instanceof check, but got ", "$0"],
    instanceof_nonobject_proto     : ["Function has non-object prototype '", "$0", "' in instanceof check"],
    construct_nonobject_proto      : ["Function has non-object prototype ", "$0"],
    null_to_object                 : ["Cannot convert null to object"],
    undefined_to_object            : ["Cannot convert undefined to object"],
    object_not_coercible           : ["$0", " cannot convert ", "$1", " to an object"],
    reduce_no_initial              : ["Reduce of empty array with no initial value"],
    callback_must_be_callable      : ["$0", " requires a function callback"],
    getter_must_be_callable        : ["Getter must be a function: ", "$0"],
    setter_must_be_callable        : ["Setter must be a function: ", "$0"],
    value_and_accessor             : ["A property cannot both have accessors and be writable or have a value, ", "$0"],
    proto_object_or_null           : ["Object prototype may only be an Object or null"],
    property_desc_object           : ["Property description must be an object: ", "$0"],
    redefine_disallowed            : ["Cannot redefine property: ", "$0"],
    apply_wrong_args               : ["Invalid arguments used in apply"],
    define_disallowed              : ["Cannot define property:", "$0", ", object is not extensible."],
    non_extensible_proto           : ["$0", " is not extensible"],
    invalid_weakmap_key            : ["Invalid value used as weak map key"],
    invalid_json                   : ["String '", "$0", "' is not valid JSON"],
    circular_structure             : ["Converting circular structure to JSON"],
    called_on_non_function         : ["$0", " called on non-function"],
    called_on_non_object           : ["$0", " called on non-object"],
    called_on_null_or_undefined    : ["$0", " called on null or undefined"],
    delete_array_index             : ["$0", " cannot delete index '", "$1", "'"],
    strict_delete_property         : ["Cannot delete property '", "$0", "' of ", "$1", " in strict mode"],
    super_delete_property          : ["Cannot delete property '", "$0", "' from super"],
    strict_cannot_assign           : ["Cannot assign to read only property '", "$0", "' in strict mode"],
    delete_property_or_throw       : ["$0", " cannot delete property '", "$1", "'"],
    put_property_or_throw          : ["$0", " cannot assign to read only property '", "$1", "'"],
    strict_poison_pill             : ["'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them"],
    object_not_extensible          : ["Can't add property ", "$0", ", object is not extensible"],
    proxy_prototype_inconsistent        : ["Cannot report a prototype value that is inconsistent with target prototype value"],
    proxy_extensibility_inconsistent    : ["Cannot report a non-extensible object as extensible or vice versa"],
    proxy_configurability_inconsistent  : ["Cannot report innacurate configurability for property '", "$0"],
    proxy_enumerate_properties          : ["Enumerate trap failed to include non-configurable enumerable property '", "$0", "'"],
    proxy_non_callable_trap             : ["Proxy trap for ", "$0", " is not a function"],
    proxy_incompatible_descriptor       : ["Proxy trap ", "$0", " returned an incompatible descriptor"],
    proxy_inconsistent                  : ["Proxy trap ", "$0", " returned an invalid value for a non-configurable property"],
    proxy_non_extensible                : ["Proxy trap ", "$0", " returned an invalid value for a non-extensible object"],
    proxy_duplicate                     : ["Proxy trap ", "$0", " returned duplicate property"],
    proxy_non_object_result             : ["Proxy trap ", "$0", " returned non-object result"],
    missing_fundamental_trap            : ["Proxy handler is missing fundamental trap ", "$0"],
    non_object_superclass               : ["non-object super class"],
    non_object_superproto               : ["non-object super prototype"],
    invalid_super_binding               : ["object has no super binding"],
    not_generic                         : ["$0", " is not generic and was called on an invalid target"],
    spread_non_object                   : ["Expecting an object as spread argument, but got ", "$0"],
    called_on_incompatible_object       : ["$0", " called on incompatible object"],
    double_initialization               : ["Initializating an already initialized ", "$0"],
    construct_arrow_function            : ["Arrow functions cannot be constructed"],
    generator_executing                 : ["'", "$0", "' called on executing generator"],
    generator_closed                    : ["'", "$0", "' called on closed generator"],
    generator_send_newborn              : ["Sent value into newborn generator"],
    unnamed_symbol                      : ["Symbol must have a name"],
    symbol_redefine                     : ["Symbol '", "$0", "' defined multiple times"],
    missing_fundamental_handler         : ["Exotic object missing fundamental handler for '", "$0", "'"],
    buffer_unaligned_offset             : ["$0", " was called with an unalign offset"],
    buffer_out_of_bounds                : ["$0", " was was called with an out of bounds length and/or offset"],
    buffer_unaligned_length             : ["$0", " was called with an unaligned length"],
    import_not_symbol                   : ["Imported object is not a symbol ", "$0"]
  },
  ReferenceError: {
    unknown_wellknown_symbol       : ["Referenced unknown well known symbol ", "$0"],
    undefined_symbol               : ["Referenced undefined symbol @", "$0"],
    unknown_label                  : ["Undefined label '", "$0", "'"],
    undefined_method               : ["Object ", "$1", " has no method '", "$0", "'"],
    not_defined                    : ["$0", " is not defined"],
    uninitialized_const            : ["$0", " is not initialized"],
    non_object_property_load       : ["Cannot read property '", "$0", "' of ", "$1"],
    non_object_property_store      : ["Cannot set property '", "$0", "' of ", "$1"],
    non_object_property_call       : ["Cannot call method '", "$0", "' of ", "$1"],
    no_setter_in_callback          : ["Cannot set property ", "$0", " of ", "$1", " which has only a getter"]
  },
  RangeError: {
    invalid_array_length           : ["Invalid array length"],
    invalid_repeat_count           : ["Invalid repeat count"],
    stack_overflow                 : ["Maximum call stack size exceeded"],
    invalid_time_value             : ["Invalid time value"]
  },
  SyntaxError : {
    multiple_defaults_in_switch    : ["More than one default clause in switch statement"],
    newline_after_throw            : ["Illegal newline after throw"],
    no_catch_or_finally            : ["Missing catch or finally after try"],
    malformed_regexp               : ["Invalid regular expression: /", "$0", "/: ", "$1"],
    unterminated_regexp            : ["Invalid regular expression: missing /"],
    regexp_flags                   : ["Cannot supply flags when constructing one RegExp from another"],
    unexpected_token               : ["Unexpected token ", "$0"],
    unexpected_token_number        : ["Unexpected number"],
    unexpected_token_string        : ["Unexpected string"],
    unexpected_token_identifier    : ["Unexpected identifier"],
    unexpected_reserved            : ["Unexpected reserved word"],
    unexpected_strict_reserved     : ["Unexpected strict mode reserved word"],
    unexpected_eos                 : ["Unexpected end of input"],
    invalid_regexp_flags           : ["Invalid flags supplied to RegExp constructor '", "$0", "'"],
    invalid_regexp                 : ["Invalid RegExp pattern /", "$0", "/"],
    illegal_break                  : ["Illegal break statement"],
    illegal_continue               : ["Illegal continue statement"],
    illegal_return                 : ["Illegal return statement"],
    illegal_let                    : ["Illegal let declaration outside extended mode"],
    illegal_access                 : ["Illegal access"],
    strict_mode_with               : ["Strict mode code may not include a with statement"],
    strict_catch_variable          : ["Catch variable may not be eval or arguments in strict mode"],
    strict_param_name              : ["Parameter name eval or arguments is not allowed in strict mode"],
    strict_param_dupe              : ["Strict mode function may not have duplicate parameter names"],
    strict_var_name                : ["Variable name may not be eval or arguments in strict mode"],
    strict_function_name           : ["Function name may not be eval or arguments in strict mode"],
    strict_octal_literal           : ["Octal literals are not allowed in strict mode."],
    strict_duplicate_property      : ["Duplicate data property in object literal not allowed in strict mode"],
    accessor_data_property         : ["Object literal may not have data and accessor property with the same name"],
    accessor_get_set               : ["Object literal may not have multiple get/set accessors with the same name"],
    strict_lhs_assignment          : ["Assignment to eval or arguments is not allowed in strict mode"],
    strict_lhs_postfix             : ["Postfix increment/decrement may not have eval or arguments operand in strict mode"],
    strict_lhs_prefix              : ["Prefix increment/decrement may not have eval or arguments operand in strict mode"],
    strict_reserved_word           : ["Use of future reserved word in strict mode"],
    strict_delete                  : ["Delete of an unqualified identifier in strict mode."],
    strict_caller                  : ["Illegal access to a strict mode caller function."],
    const_assign                   : ["Assignment to constant variable."],
    invalid_module_path            : ["Module does not export '", "$0", "', or export is not itself a module"],
    module_type_error              : ["Module '", "$0", "' used improperly"]
  }
}, typeof module !== 'undefined' ? module.exports : {});

