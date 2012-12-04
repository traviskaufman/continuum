import now from '@date';
import Map from '@map';

function join(values){
  var text = '';
  for (var i=0; i < values.length; i++) {
    text += values[i];
  }
  return text;
}



export class Console {
  private @output, @timers, @write, @writeln;

  constructor(output){
    this.@output = output;
    this.@timers = new Map;
  }

  @write(value, color){
    color || (color = '#fff');
    this.@output.signal('write', '' + value, '' + color);
  }

  @writeln(value, color){
    color || (color = '#fff');
    this.@output.signal('write', value + '\n', '' + color);
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

  dir(object){
    this.@output.signal('inspect', object);
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
    this.@timers[name] = now();
  }

  timeEnd(name){
    if (this.@timers.has(name)) {
      var duration = now() - this.@timers.get(name);
      this.@writeln(name + ': ' + duration + 'ms');
    }
  }

  timeStamp(name){
    this.@writeln(name + ': ' + now());
  }

  trace(error){
    // TODO
  }

  warn(...values){
    this.@writeln('! '+join(values), '#ff6');
  }
}


export let console = new Console({ signal: $__Signal });
