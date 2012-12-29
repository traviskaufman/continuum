function getter(o, name){
  if (o === null || typeof o !== 'object' || $__GetBuiltinBrand(o) !== 'Date') {
    throw $__Exception('not_generic', ['Date.prototype.'+name]);
  }
  return $__CallBuiltin(this.@@DateValue, name);
}

internalFunction(getter);

function setter(o, name, value){
  if (o === null || typeof o !== 'object' || $__GetBuiltinBrand(o) !== 'Date') {
    throw $__Exception('not_generic', ['Date.prototype.'+name]);
  }
  $__CallBuiltin(this.@@DateValue, name, [value]);
}

internalFunction(setter);

export class Date {
  constructor(...values){
    return $__DateCreate(...values);
  }

  getDate(){
    return getter(this, 'getDate');
  }
  getDay(){
    return getter(this, 'getDay');
  }
  getFullYear(){
    return getter(this, 'getFullYear');
  }
  getHours(){
    return getter(this, 'getHours');
  }
  getMilliseconds(){
    return getter(this, 'getMilliseconds');
  }
  getMinutes(){
    return getter(this, 'getMinutes');
  }
  getMonth(){
    return getter(this, 'getMonth');
  }
  getSeconds(){
    return getter(this, 'getSeconds');
  }
  getTime(){
    return getter(this, 'getTime');
  }
  getTimezoneOffset(){
    return getter(this, 'getTimezoneOffset');
  }
  getYear(){
    return getter(this, 'getYear');
  }

  getUTCDate(){
    return getter(this, 'getUTCDate');
  }
  getUTCDay(){
    return getter(this, 'getUTCDay');
  }
  getUTCFullYear(){
    return getter(this, 'getUTCFullYear');
  }
  getUTCHours(){
    return getter(this, 'getUTCHours');
  }
  getUTCMilliseconds(){
    return getter(this, 'getUTCMilliseconds');
  }
  getUTCMinutes(){
    return getter(this, 'getUTCMinutes');
  }
  getUTCMonth(){
    return getter(this, 'getUTCMonth');
  }
  getUTCSeconds(){
    return getter(this, 'getUTCSeconds');
  }

  setDate(date){
    setter(this, 'setDate', date);
  }
  setFullYear(year){
    setter(this, 'setFullYear', year);
  }
  setHours(hours){
    setter(this, 'setHours', hours);
  }
  setMilliseconds(milliseconds){
    setter(this, 'setMilliseconds', milliseconds);
  }
  setMinutes(minutes){
    setter(this, 'setMinutes', minutes);
  }
  setMonth(month){
    setter(this, 'setMonth', month);
  }
  setSeconds(seconds){
    setter(this, 'setSeconds', seconds);
  }
  setTime(time){
    setter(this, 'setTime', time);
  }
  setYear(year){
    setter(this, 'setYear', year);
  }

  setUTCDate(date){
    setter(this, 'setUTCDate', date);
  }
  setUTCFullYear(year){
    setter(this, 'setUTCFullYear', year);
  }
  setUTCHours(hours){
    setter(this, 'setUTCHours', hours);
  }
  setUTCMilliseconds(milliseconds){
    setter(this, 'setUTCMilliseconds', milliseconds);
  }
  setUTCMinutes(minutes){
    setter(this, 'setUTCMinutes', minutes);
  }
  setUTCMonth(month){
    setter(this, 'setUTCMonth', month);
  }
  setUTCSeconds(seconds){
    setter(this, 'setUTCSeconds', seconds);
  }

  toDateString(){
    return getter(this, 'toDateString');
  }
  toGMTString(){
    return getter(this, 'toGMTString');
  }
  toISOString(){
    return getter(this, 'toISOString');
  }
  toJSON(){
    return getter(this, 'toJSON');
  }
  toLocaleDateString(){
    return getter(this, 'toLocaleDateString');
  }
  toLocaleString(){
    return getter(this, 'toLocaleString');
  }
  toLocaleTimeString(){
    return getter(this, 'toLocaleTimeString');
  }
  toString(){
    return getter(this, 'toString');
  }
  toTimeString(){
    return getter(this, 'toTimeString');
  }
  toUTCString(){
    return getter(this, 'toUTCString');
  }
  valueOf(){
    return getter(this, 'valueOf');
  }
}

builtinClass(Date);

export const now = $__now;
extend(Date, { now });
