
export function parse(src, { loc, range, raw, tokens, comment, source, tolerant } = { source: null }){
  return $__parse(src, loc, range, raw, tokens, comment, tolerant, source);
}

export class Position {
  constructor(line = 1, column = 0){
    this.line = line;
    this.column = column;
  }
}

export class SourceLocation {
  constructor(start, end){
    this.start = new Position(start);
    this.end = new Position(end);
  }
}

export class ASTNode {
  private @type;
  constructor(type) {
    this.type = type;
  }
  get type() {
    return this.@type;
  }
  set type(val) {
    this.@type = val;
  }
}

export class ASTNodeList {
  private @nodes;
  constructor(...nodes) {
    return index(this, nodes, @nodes);
  }
}

export class Expression extends ASTNode {}
export class Pattern extends ASTNode {}
export class Statement extends ASTNode {}
export class Declaration extends Statement {}

export class ArrayExpression extends Expression {
  private @elements;
  constructor(elements) {
    this.elements = elements;
  }
  get elements() {
    return this.@elements;
  }
  set elements(nodelist) {
    this.@elements = nodelist;
  }
}

export class ArrayPattern extends Pattern {
  private @elements;
  constructor(elements) {
    this.elements = elements;
  }
  get elements() {
    return this.@elements;
  }
  set elements(nodelist) {
    this.@elements = nodelist;
  }
}

export class ArrowFunctionExpression extends Expression {
  private @params, @body, @defaults, @rest, @generator;
  constructor(params, body, defaults, rest, generator) {
    this.params = params;
    this.body = body;
    this.defaults = defaults;
    this.rest = rest;
    this.generator = generator;
  }
  get params() {
    return this.@params;
  }
  set params(nodelist) {
    this.@params = nodelist;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get defaults() {
    return this.@defaults;
  }
  set defaults(nodelist) {
    this.@defaults = nodelist;
  }
  get rest() {
    return this.@rest;
  }
  set rest(node) {
    this.@rest = node;
  }
  get generator() {
    return this.@generator;
  }
  set generator(val) {
    this.@generator = val;
  }
}

export class AssignmentExpression extends Expression {
  private @left, @right, @operator;
  constructor(left, right, operator) {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
  get left() {
    return this.@left;
  }
  set left(node) {
    this.@left = node;
  }
  get right() {
    return this.@right;
  }
  set right(node) {
    this.@right = node;
  }
  get operator() {
    return this.@operator;
  }
  set operator(val) {
    this.@operator = val;
  }
}

export class AtSymbol extends Expression {
  private @name, @internal;
  constructor(name, internal) {
    this.name = name;
    this.internal = internal;
  }
  get name() {
    return this.@name;
  }
  set name(val) {
    this.@name = val;
  }
  get internal() {
    return this.@internal;
  }
  set internal(val) {
    this.@internal = val;
  }
}

export class BlockStatement extends Statement {
  private @body;
  constructor(body) {
    this.body = body;
  }
  get body() {
    return this.@body;
  }
  set body(nodelist) {
    this.@body = nodelist;
  }
}

export class BinaryExpression extends Expression {
  private @left, @right, @operator;
  constructor(left, right, operator) {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
  get left() {
    return this.@left;
  }
  set left(node) {
    this.@left = node;
  }
  get right() {
    return this.@right;
  }
  set right(node) {
    this.@right = node;
  }
  get operator() {
    return this.@operator;
  }
  set operator(val) {
    this.@operator = val;
  }
}

export class BreakStatement extends Statement {
  private @label;
  constructor(label) {
    this.label = label;
  }
  get label() {
    return this.@label;
  }
  set label(val) {
    this.@label = val;
  }
}

export class CallExpression extends Expression {
  private @callee, @args;
  constructor(callee, args) {
    this.callee = callee;
    this.args = args;
  }
  get callee() {
    return this.@callee;
  }
  set callee(node) {
    this.@callee = node;
  }
  get args() {
    return this.@args;
  }
  set args(nodelist) {
    this.@args = nodelist;
  }
}

export class CatchClause extends ASTNode {
  private @param, @body;
  constructor(param, body) {
    this.param = param;
    this.body = body;
  }
  get param() {
    return this.@param;
  }
  set param(node) {
    this.@param = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class ConditionalExpression extends Expression {
  private @test, @consequent, @alternate;
  constructor(test, consequent, alternate) {
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  get test() {
    return this.@test;
  }
  set test(node) {
    this.@test = node;
  }
  get consequent() {
    return this.@consequent;
  }
  set consequent(node) {
    this.@consequent = node;
  }
  get alternate() {
    return this.@alternate;
  }
  set alternate(node) {
    this.@alternate = node;
  }
}

export class ClassBody extends ASTNode {
  private @body;
  constructor(body) {
    this.body = body;
  }
  get body() {
    return this.@body;
  }
  set body(nodelist) {
    this.@body = nodelist;
  }
}

export class ClassDeclaration extends Declaration {
  private @id, @body, @superClass;
  constructor(id, body, superClass) {
    this.id = id;
    this.body = body;
    this.superClass = superClass;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get superClass() {
    return this.@superClass;
  }
  set superClass(node) {
    this.@superClass = node;
  }
}

export class ClassExpression extends Expression {
  private @id, @body, @superClass;
  constructor(id, body, superClass) {
    this.id = id;
    this.body = body;
    this.superClass = superClass;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get superClass() {
    return this.@superClass;
  }
  set superClass(node) {
    this.@superClass = node;
  }
}

export class ContinueStatement extends Statement {
  private @label;
  constructor(label) {
    this.label = label;
  }
  get label() {
    return this.@label;
  }
  set label(val) {
    this.@label = val;
  }
}

export class ComprehensionBlock extends ASTNode {
  private @left, @right, @body;
  constructor(left, right, body) {
    this.left = left;
    this.right = right;
    this.body = body;
  }
  get left() {
    return this.@left;
  }
  set left(node) {
    this.@left = node;
  }
  get right() {
    return this.@right;
  }
  set right(node) {
    this.@right = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class ComprehensionExpression extends Expression {
  private @filter, @blocks, @body;
  constructor(filter, blocks, body) {
    this.filter = filter;
    this.blocks = blocks;
    this.body = body;
  }
  get filter() {
    return this.@filter;
  }
  set filter(node) {
    this.@filter = node;
  }
  get blocks() {
    return this.@blocks;
  }
  set blocks(nodelist) {
    this.@blocks = nodelist;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class DoWhileStatement extends Statement {
  private @body, @test;
  constructor(body, test) {
    this.body = body;
    this.test = test;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get test() {
    return this.@test;
  }
  set test(node) {
    this.@test = node;
  }
}

export class DebuggerStatement extends Statement {
}

export class EmptyStatement extends Statement {
}

export class ExportDeclaration extends Statement {
  private @specifiers, @declaration;
  constructor(specifiers, declaration) {
    this.specifiers = specifiers;
    this.declaration = declaration;
  }
  get specifiers() {
    return this.@specifiers;
  }
  set specifiers(nodelist) {
    this.@specifiers = nodelist;
  }
  get declaration() {
    return this.@declaration;
  }
  set declaration(node) {
    this.@declaration = node;
  }
}

export class ExportSpecifier extends ASTNode {
  private @id, @from;
  constructor(id, from) {
    this.id = id;
    this.from = from;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get from() {
    return this.@from;
  }
  set from(node) {
    this.@from = node;
  }
}

export class ExportSpecifierSet extends ASTNode {
  private @specifiers;
  constructor(specifiers) {
    this.specifiers = specifiers;
  }
  get specifiers() {
    return this.@specifiers;
  }
  set specifiers(node) {
    this.@specifiers = node;
  }
}

export class ExpressionStatement extends Statement {
  private @expression;
  constructor(expression) {
    this.expression = expression;
  }
  get expression() {
    return this.@expression;
  }
  set expression(node) {
    this.@expression = node;
  }
}

export class ForStatement extends Statement {
  private @init, @test, @update, @body;
  constructor(init, test, update, body) {
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
  get init() {
    return this.@init;
  }
  set init(node) {
    this.@init = node;
  }
  get test() {
    return this.@test;
  }
  set test(node) {
    this.@test = node;
  }
  get update() {
    return this.@update;
  }
  set update(node) {
    this.@update = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class ForInStatement extends Statement {
  private @left, @right, @body;
  constructor(left, right, body) {
    this.left = left;
    this.right = right;
    this.body = body;
  }
  get left() {
    return this.@left;
  }
  set left(node) {
    this.@left = node;
  }
  get right() {
    return this.@right;
  }
  set right(node) {
    this.@right = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class ForOfStatement extends Statement {
  private @left, @right, @body;
  constructor(left, right, body) {
    this.left = left;
    this.right = right;
    this.body = body;
  }
  get left() {
    return this.@left;
  }
  set left(node) {
    this.@left = node;
  }
  get right() {
    return this.@right;
  }
  set right(node) {
    this.@right = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class FunctionDeclaration extends Declaration {
  private @id, @params, @body, @defaults, @rest, @generator;
  constructor(id, params, body, defaults, rest, generator) {
    this.id = id;
    this.params = params;
    this.body = body;
    this.defaults = defaults;
    this.rest = rest;
    this.generator = generator;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get params() {
    return this.@params;
  }
  set params(nodelist) {
    this.@params = nodelist;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get defaults() {
    return this.@defaults;
  }
  set defaults(nodelist) {
    this.@defaults = nodelist;
  }
  get rest() {
    return this.@rest;
  }
  set rest(node) {
    this.@rest = node;
  }
  get generator() {
    return this.@generator;
  }
  set generator(val) {
    this.@generator = val;
  }
}

export class FunctionExpression extends Expression {
  private @id, @params, @body, @defaults, @rest, @generator;
  constructor(id, params, body, defaults, rest, generator) {
    this.id = id;
    this.params = params;
    this.body = body;
    this.defaults = defaults;
    this.rest = rest;
    this.generator = generator;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get params() {
    return this.@params;
  }
  set params(nodelist) {
    this.@params = nodelist;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get defaults() {
    return this.@defaults;
  }
  set defaults(nodelist) {
    this.@defaults = nodelist;
  }
  get rest() {
    return this.@rest;
  }
  set rest(node) {
    this.@rest = node;
  }
  get generator() {
    return this.@generator;
  }
  set generator(val) {
    this.@generator = val;
  }
}

export class Glob extends ASTNode {
}

export class Identifier extends Expression {
  private @name;
  constructor(name) {
    this.name = name;
  }
  get name() {
    return this.@name;
  }
  set name(val) {
    this.@name = val;
  }
}

export class IfStatement extends Statement {
  private @test, @consequent, @alternate;
  constructor(test, consequent, alternate) {
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  get test() {
    return this.@test;
  }
  set test(node) {
    this.@test = node;
  }
  get consequent() {
    return this.@consequent;
  }
  set consequent(node) {
    this.@consequent = node;
  }
  get alternate() {
    return this.@alternate;
  }
  set alternate(node) {
    this.@alternate = node;
  }
}

export class ImportDeclaration extends Statement {
  private @specifiers, @from;
  constructor(specifiers, from) {
    this.specifiers = specifiers;
    this.from = from;
  }
  get specifiers() {
    return this.@specifiers;
  }
  set specifiers(nodelist) {
    this.@specifiers = nodelist;
  }
  get from() {
    return this.@from;
  }
  set from(node) {
    this.@from = node;
  }
}

export class ImportSpecifier extends ASTNode {
  private @id, @from;
  constructor(id, from) {
    this.id = id;
    this.from = from;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get from() {
    return this.@from;
  }
  set from(node) {
    this.@from = node;
  }
}

export class Literal extends Expression {
  private @value;
  constructor(value) {
    this.value = value;
  }
  get value() {
    return this.@value;
  }
  set value(val) {
    this.@value = val;
  }
}

export class LabeledStatement extends Statement {
  private @label, @body;
  constructor(label, body) {
    this.label = label;
    this.body = body;
  }
  get label() {
    return this.@label;
  }
  set label(val) {
    this.@label = val;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class LogicalExpression extends Expression {
  private @left, @right, @operator;
  constructor(left, right, operator) {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
  get left() {
    return this.@left;
  }
  set left(node) {
    this.@left = node;
  }
  get right() {
    return this.@right;
  }
  set right(node) {
    this.@right = node;
  }
  get operator() {
    return this.@operator;
  }
  set operator(val) {
    this.@operator = val;
  }
}

export class MemberExpression extends Expression {
  private @object, @property, @computed;
  constructor(object, property, computed) {
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
  get object() {
    return this.@object;
  }
  set object(node) {
    this.@object = node;
  }
  get property() {
    return this.@property;
  }
  set property(node) {
    this.@property = node;
  }
  get computed() {
    return this.@computed;
  }
  set computed(val) {
    this.@computed = val;
  }
}

export class MethodDefinition extends ASTNode {
  private @key, @value, @kind;
  constructor(key, value, kind) {
    this.key = key;
    this.value = value;
    this.kind = kind;
  }
  get key() {
    return this.@key;
  }
  set key(node) {
    this.@key = node;
  }
  get value() {
    return this.@value;
  }
  set value(node) {
    this.@value = node;
  }
  get kind() {
    return this.@kind;
  }
  set kind(val) {
    this.@kind = val;
  }
}

export class ModuleDeclaration extends Declaration {
  private @id, @body, @from;
  constructor(id, body, from) {
    this.id = id;
    this.body = body;
    this.from = from;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
  get from() {
    return this.@from;
  }
  set from(node) {
    this.@from = node;
  }
}

export class NewExpression extends Expression {
  private @callee, @args;
  constructor(callee, args) {
    this.callee = callee;
    this.args = args;
  }
  get callee() {
    return this.@callee;
  }
  set callee(node) {
    this.@callee = node;
  }
  get args() {
    return this.@args;
  }
  set args(nodelist) {
    this.@args = nodelist;
  }
}

export class ObjectExpression extends Expression {
  private @properties;
  constructor(properties) {
    this.properties = properties;
  }
  get properties() {
    return this.@properties;
  }
  set properties(nodelist) {
    this.@properties = nodelist;
  }
}

export class ObjectPattern extends Pattern {
  private @properties;
  constructor(properties) {
    this.properties = properties;
  }
  get properties() {
    return this.@properties;
  }
  set properties(nodelist) {
    this.@properties = nodelist;
  }
}

export class Path extends ASTNode {
  private @body;
  constructor(body) {
    this.body = body;
  }
  get body() {
    return this.@body;
  }
  set body(nodelist) {
    this.@body = nodelist;
  }
}

export class Program extends ASTNode {
  private @body;
  constructor(body) {
    this.body = body;
  }
  get body() {
    return this.@body;
  }
  set body(nodelist) {
    this.@body = nodelist;
  }
}

export class Property extends ASTNode {
  private @key, @value, @kind, @method, @shorthand;
  constructor(key, value, kind, method, shorthand) {
    this.key = key;
    this.value = value;
    this.kind = kind;
    this.method = method;
    this.shorthand = shorthand;
  }
  get key() {
    return this.@key;
  }
  set key(node) {
    this.@key = node;
  }
  get value() {
    return this.@value;
  }
  set value(node) {
    this.@value = node;
  }
  get kind() {
    return this.@kind;
  }
  set kind(val) {
    this.@kind = val;
  }
  get method() {
    return this.@method;
  }
  set method(val) {
    this.@method = val;
  }
  get shorthand() {
    return this.@shorthand;
  }
  set shorthand(val) {
    this.@shorthand = val;
  }
}

export class ReturnStatement extends Statement {
  private @arg;
  constructor(arg) {
    this.arg = arg;
  }
  get arg() {
    return this.@arg;
  }
  set arg(node) {
    this.@arg = node;
  }
}

export class SequenceExpression extends Expression {
  private @expressions;
  constructor(expressions) {
    this.expressions = expressions;
  }
  get expressions() {
    return this.@expressions;
  }
  set expressions(nodelist) {
    this.@expressions = nodelist;
  }
}

export class SpreadElement extends ASTNode {
  private @arg;
  constructor(arg) {
    this.arg = arg;
  }
  get arg() {
    return this.@arg;
  }
  set arg(node) {
    this.@arg = node;
  }
}

export class SwitchStatement extends Statement {
  private @descriminant, @cases;
  constructor(descriminant, cases) {
    this.descriminant = descriminant;
    this.cases = cases;
  }
  get descriminant() {
    return this.@descriminant;
  }
  set descriminant(node) {
    this.@descriminant = node;
  }
  get cases() {
    return this.@cases;
  }
  set cases(nodelist) {
    this.@cases = nodelist;
  }
}

export class SwitchCase extends ASTNode {
  private @test, @consequent;
  constructor(test, consequent) {
    this.test = test;
    this.consequent = consequent;
  }
  get test() {
    return this.@test;
  }
  set test(node) {
    this.@test = node;
  }
  get consequent() {
    return this.@consequent;
  }
  set consequent(nodelist) {
    this.@consequent = nodelist;
  }
}

export class SymbolDeclaration extends Declaration {
  private @declarations, @kind;
  constructor(declarations, kind) {
    this.declarations = declarations;
    this.kind = kind;
  }
  get declarations() {
    return this.@declarations;
  }
  set declarations(nodelist) {
    this.@declarations = nodelist;
  }
  get kind() {
    return this.@kind;
  }
  set kind(val) {
    this.@kind = val;
  }
}

export class SymbolDeclarator extends ASTNode {
  private @id, @init;
  constructor(id, init) {
    this.id = id;
    this.init = init;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get init() {
    return this.@init;
  }
  set init(node) {
    this.@init = node;
  }
}

export class TaggedTemplateExpression extends Expression {
  private @tag, @template;
  constructor(tag, template) {
    this.tag = tag;
    this.template = template;
  }
  get tag() {
    return this.@tag;
  }
  set tag(node) {
    this.@tag = node;
  }
  get template() {
    return this.@template;
  }
  set template(node) {
    this.@template = node;
  }
}

export class TemplateElement extends ASTNode {
  private @value, @tail;
  constructor(value, tail) {
    this.value = value;
    this.tail = tail;
  }
  get value() {
    return this.@value;
  }
  set value(val) {
    this.@value = val;
  }
  get tail() {
    return this.@tail;
  }
  set tail(val) {
    this.@tail = val;
  }
}

export class TemplateLiteral extends Expression {
  private @elements, @expressions;
  constructor(elements, expressions) {
    this.elements = elements;
    this.expressions = expressions;
  }
  get elements() {
    return this.@elements;
  }
  set elements(nodelist) {
    this.@elements = nodelist;
  }
  get expressions() {
    return this.@expressions;
  }
  set expressions(nodelist) {
    this.@expressions = nodelist;
  }
}

export class ThisExpression extends Expression {
}

export class ThrowStatement extends Statement {
  private @arg;
  constructor(arg) {
    this.arg = arg;
  }
  get arg() {
    return this.@arg;
  }
  set arg(node) {
    this.@arg = node;
  }
}

export class TryStatement extends Statement {
  private @block, @handlers, @finalizer;
  constructor(block, handlers, finalizer) {
    this.block = block;
    this.handlers = handlers;
    this.finalizer = finalizer;
  }
  get block() {
    return this.@block;
  }
  set block(node) {
    this.@block = node;
  }
  get handlers() {
    return this.@handlers;
  }
  set handlers(nodelist) {
    this.@handlers = nodelist;
  }
  get finalizer() {
    return this.@finalizer;
  }
  set finalizer(node) {
    this.@finalizer = node;
  }
}

export class UnaryExpression extends Expression {
  private @arg, @operator;
  constructor(arg, operator) {
    this.arg = arg;
    this.operator = operator;
  }
  get arg() {
    return this.@arg;
  }
  set arg(node) {
    this.@arg = node;
  }
  get operator() {
    return this.@operator;
  }
  set operator(val) {
    this.@operator = val;
  }
}

export class UpdateExpression extends Expression {
  private @arg, @operator, @prefix;
  constructor(arg, operator, prefix) {
    this.arg = arg;
    this.operator = operator;
    this.prefix = prefix;
  }
  get arg() {
    return this.@arg;
  }
  set arg(node) {
    this.@arg = node;
  }
  get operator() {
    return this.@operator;
  }
  set operator(val) {
    this.@operator = val;
  }
  get prefix() {
    return this.@prefix;
  }
  set prefix(val) {
    this.@prefix = val;
  }
}

export class VariableDeclaration extends Declaration {
  private @declarations, @kind;
  constructor(declarations, kind) {
    this.declarations = declarations;
    this.kind = kind;
  }
  get declarations() {
    return this.@declarations;
  }
  set declarations(nodelist) {
    this.@declarations = nodelist;
  }
  get kind() {
    return this.@kind;
  }
  set kind(val) {
    this.@kind = val;
  }
}

export class VariableDeclarator extends ASTNode {
  private @id, @init;
  constructor(id, init) {
    this.id = id;
    this.init = init;
  }
  get id() {
    return this.@id;
  }
  set id(node) {
    this.@id = node;
  }
  get init() {
    return this.@init;
  }
  set init(node) {
    this.@init = node;
  }
}

export class WhileStatement extends Statement {
  private @test, @body;
  constructor(test, body) {
    this.test = test;
    this.body = body;
  }
  get test() {
    return this.@test;
  }
  set test(node) {
    this.@test = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class WithStatement extends Statement {
  private @object, @body;
  constructor(object, body) {
    this.object = object;
    this.body = body;
  }
  get object() {
    return this.@object;
  }
  set object(node) {
    this.@object = node;
  }
  get body() {
    return this.@body;
  }
  set body(node) {
    this.@body = node;
  }
}

export class YieldExpression extends Expression {
  private @arg;
  constructor(arg) {
    this.arg = arg;
  }
  get arg() {
    return this.@arg;
  }
  set arg(node) {
    this.@arg = node;
  }
}
