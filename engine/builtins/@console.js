import {
  now
} from '@date';

import {
  Map
} from '@map';

import {
  Error
} from '@error';

import {
  ToString
} from '@@operations';


const QUIET = $__createUndetectable('quiet');


export class Console {
  private @output, @timers, @write, @writeln;

  constructor(output){
    this.@output = output;
    this.@timers = new Map;
  }

  @write(value, color = '#fff'){
    this.@output.signal('write', ToString(value), ToString(color));
  }

  @writeln(value, color = '#fff'){
    this.@output.signal('write', value + '\n', ToString(color));
  }

  assert(expression, ...values){
    if (!expression) {
      values = values.join('');
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
    this.@writeln(values.join(''));
    return QUIET;
  }

  dir(object){
    this.@output.signal('inspect', [object], true);
    return QUIET;
  }

  dirxml(){
    // TODO
  }

  error(...values){
    this.@writeln('× '+values.join(''), '#f04');
    return QUIET;
  }

  group(...values){
    this.@writeln('» '+values.join(''));
    this.@output.signal('group');
  }

  groupCollapsed(...values){
    this.@writeln('» '+values.join(''));
    this.@output.signal('group-collapsed');
  }

  groupEnd(){
    this.@output.signal('group-end');
  }

  info(...values){
    this.@writeln('† '+values.join(''), '#09f');
    return QUIET;
  }

  log(...values){
    this.@output.signal('inspect', values);
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
      const duration = now() - this.@timers.get(name);
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
    this.@writeln('! '+values.join(''), '#ff6');
    return QUIET;
  }
}


export const console = new Console({ signal: $__Signal });
