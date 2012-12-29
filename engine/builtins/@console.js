import now from '@date';
import Map from '@map';

function join(values){
  var text = '';
  for (var i=0; i < values.length; i++) {
    text += values[i];
  }
  return text;
}

const QUIET = $__createUndetectable('quiet');


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
    return QUIET;
  }

  clear(){
    this.@output.signal('clear');
    return QUIET;
  }

  count(title){
    // TODO
  }

  debug(...values){
    this.@writeln(join(values));
    return QUIET;
  }

  dir(object){
    this.@output.signal('inspect', object, true);
    return QUIET;
  }

  dirxml(){
    // TODO
  }

  error(...values){
    this.@writeln('× '+join(values), '#f04');
    return QUIET;
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
    return QUIET;
  }

  log(...values){
    values.forEach(value => this.@output.signal('inspect', value));
    return QUIET;
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
    return QUIET;
  }

  timeEnd(name){
    if (this.@timers.has(name)) {
      var duration = now() - this.@timers.get(name);
      this.@writeln(name + ': ' + duration + 'ms');
    }
    return QUIET;
  }

  timeStamp(name){
    this.@writeln(name + ': ' + now());
    return QUIET;
  }

  trace(error){
    // TODO
  }

  warn(...values){
    this.@writeln('! '+join(values), '#ff6');
    return QUIET;
  }
}


export let console = new Console({ signal: $__Signal });
