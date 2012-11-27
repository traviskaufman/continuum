
export class Console {
  private @output, @timers, @write, @writeln;

  constructor(output){
    this.@output = output;
    this.@timers = $__ObjectCreate(null);
  }

  @write(value, color){
    color || (color = '#fff');
    this.@output.signal('write', ['' + value, '' + color]);
  }

  @writeln(value, color){
    color || (color = '#fff');
    this.@output.signal('write', [value + '\n', '' + color]);
  }

  assert(expression, ...values){
    if (!expression) {
      values = join(values);
      this.@writeln(values);
      throw new Error('Assertion failed: '+values);
    }
  }

  clear(){
    this.@output.signal('clear');
  }

  count(title){
    // TODO
  }

  debug(){
    this.@writeln(join(values));
  }

  dir(){
    // TODO
  }

  dirxml(){
    // TODO
  }

  error(...values){
    this.@writeln('× '+join(values), '#f04');
  }

  group(...values){
    this.@writeln('» '+join(values));
    this.@output.signal('group');
  }

  groupCollapsed(...values){
    this.@writeln('» '+join(values));
    this.@output.signal('group-collapsed');
  }

  groupEnd(){
    this.@output.signal('group-end');
  }

  info(...values){
    this.@writeln('† '+join(values), '#09f');
  }

  log(...values){
    this.@writeln('» '+join(values));
  }

  profile(){
    // TODO
  }

  profileEnd(){
    // TODO
  }

  table(data, columns){
    // TODO
  }

  time(name){
    this.@timers[name] = $__now();
  }

  timeEnd(name){
    if (name in this.@timers) {
      var duration = $__now() - this.@timers[name];
      this.@writeln(name + ': ' + duration + 'ms');
    }
  }

  timeStamp(name){
    this.@writeln(name + ': ' + $__now());
  }

  trace(error){
    // TODO
  }

  warn(...values){
    this.@writeln('! '+join(values), '#ff6');
  }
}

function join(values){
  var text = '';
  for (var i=0; i < values.length; i++) {
    text += values[i];
  }
  return text;
}


export let console = new Console({ signal: $__Signal });
