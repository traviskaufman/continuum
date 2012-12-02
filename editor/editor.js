class ASTNode {
  constructor(){

  }
}


class ArrayExpression extends ASTNode {
  constructor(elements){
  }
}

class ArrowFunctionExpression extends ASTNode {
  constructor(params, body){
  }
}

class ArrayPattern extends ASTNode {
  constructor(elements){
  }
}

class AssignmentExpression extends ASTNode {
  constructor(operator, left, right){
  }
}

class BinaryExpression extends ASTNode {
  constructor(operator, left, right){
  }
}

class BlockStatement extends ASTNode {
  constructor(body){
  }
}

class BreakStatement extends ASTNode {
  constructor(label){
  }
}

class CallExpression extends ASTNode {
  constructor(callee, arguments){
  }
}

class CatchClause extends ASTNode {
  constructor(param, body){
  }
}

class ClassBody extends ASTNode {
  constructor(body){
  }
}

class ClassDeclaration extends ASTNode {
  constructor(id, params, body){
  }
}

class ClassExpression extends ASTNode {
  constructor(id, params, body){
  }
}


class ConditionalExpression extends ASTNode {
  constructor(test, consequent, alternate){
  }
}

class ContinueStatement extends ASTNode {
  constructor(label){
  }
}

class EmptyStatement extends ASTNode {
  constructor(){
  }
}

class ExportSpecifier extends ASTNode {
  constructor(id, from){
  }
}

class ExportSpecifierSet extends ASTNode {
  constructor(specifiers){
  }
}

class DebuggerStatement extends ASTNode {
  constructor(){
  }
}

class DoWhileStatement extends ASTNode {
  constructor(body, test){
  }
}

class ExportDeclaration extends ASTNode {
  constructor(declaration){
  }
}

class ExpressionStatement extends ASTNode {
  constructor(expression){
  }
}

class ForInStatement extends ASTNode {
  constructor(left, right, body){
  }
}

class ForOfStatement extends ASTNode {
  constructor(left, right, body){
  }
}

class ForStatement extends ASTNode {
  constructor(init, test, update, body){
  }
}

class FunctionDeclaration extends ASTNode {
  constructor(id, params, body){
  }
}

class FunctionExpression extends ASTNode {
  constructor(id, params, body){
  }
}

class Glob extends ASTNode {
  constructor(){
  }
}

class Identifier extends ASTNode {
  constructor(name){
  }
}

class IfStatement extends ASTNode {
  constructor(test, consequent, alternate){
  }
}

class ImportDeclaration extends ASTNode {
  constructor(specifiers, from){
  }
}
class ImportSpecifier extends ASTNode {
  constructor(id, from){
  }
}

class LabeledStatement extends ASTNode {
  constructor(label, body){
  }
}

class Literal extends ASTNode {
  constructor(value){
  }
}

class LogicalExpression extends ASTNode {
  constructor(operator, left, right){
  }
}

class MemberExpression extends ASTNode {
  constructor(object, property){
  }
}

class MethodDefinition extends ASTNode {
  constructor(kind, key, value){
  }
}
class ModuleDeclaration extends ASTNode {
  constructor(id, body, from){
  }
}

class NewExpression extends ASTNode {
  constructor(callee, arguments){
  }
}

class ObjectExpression extends ASTNode {
  constructor(properties){
  }
}

class ObjectPattern extends ASTNode {
  constructor(properties){
  }
}

class Path extends ASTNode {
  constructor(body){
  }
}

class Program extends ASTNode {
  constructor(body){
  }
}

class Property extends ASTNode {
  constructor(kind, key, value){
  }
}

class ReturnStatement extends ASTNode {
  constructor(argument){
  }
}

class SequenceExpression extends ASTNode {
  constructor(expressions){
  }
}

class SpreadElement extends ASTNode {
  constructor(argument){
  }
}

class SwitchCase extends ASTNode {
  constructor(test, consequent){
  }
}

class SwitchStatement extends ASTNode {
  constructor(descriminant, cases){
  }
}

class SymbolDeclaration extends ASTNode {
  constructor(declarations){
  }
}

class SymbolDeclarator extends ASTNode {
  constructor(id, init){
  }
}

class TaggedTemplateExpression extends ASTNode {
  constructor(template){
  }
}

class TemplateElement extends ASTNode {
  constructor(value, tail){
  }
}

class TemplateLiteral extends ASTNode {
  constructor(templates, expressions){
  }
}

class ThisExpression extends ASTNode {
  constructor(){
  }
}

class ThrowStatement extends ASTNode {
  constructor(argument){
  }
}

class TryStatement extends ASTNode {
  constructor(block, handlers, finalizer){
  }
}

class UnaryExpression extends ASTNode {
  constructor(operator, argument){
  }
}

class UpdateExpression extends ASTNode {
  constructor(operator, argument){
  }
}

class WithStatement extends ASTNode {
  constructor(object, body){
  }
}

class WhileStatement extends ASTNode {
  constructor(test, body){
  }
}

class VariableDeclaration extends ASTNode {
  constructor(declarations){
  }
}

class VariableDeclarator extends ASTNode {
  constructor(id, init){
  }
}

class YieldExpression extends ASTNode {
  constructor(argument){
  }
}
