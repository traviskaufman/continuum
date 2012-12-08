import { iterator, Iterator } from '@iter';
symbol @iterator = iterator;
private @sentinel;

class LinkedMapIterator extends Iterator {
  private @current;

  constructor(list){
    this.@current = list.@sentinel;
    this.@sentinel = list.@sentinel;
  }

  next(){
    this.@current = this.@current.next;
    if (this.@current === this.@sentinel) {
      throw Stopiteration;
    }
    return this.@current.data;
  }
}

class LinkedElement {
  constructor(data, prev){
    this.data = data;
    this.prev = prev;
    this.next = prev.next;
    prev.next.prev = this;
    prev.next = this;
  }

  unlink(){
    if (this.next) {
      this.next.prev = this.prev;
    }
    if (this.prev) {
      this.prev.next = this.next;
    }
    this.prev = this.next = null;
    return this;
  }

  clear(){
    var data = this.data;
    this.next = this.prev = this.data = null;
    return data;
  }
}

class Sentinel extends LinkedElement {
  constructor(){
    this.next = this;
    this.prev = this;
  }

  unlink(){
    return this;
  }
}


export class LinkedMap {
  private @items;

  constructor(iterable){
    this.size = 0;
    this.@sentinel = new Sentinel;
    this.@items = new Map;
    if (iterable) {
      for (value of iterable) {
        this.push(value);
      }
    }
  }

  get first(){
    return this.@sentinel.next.data;
  }

  get last(){
    return this.@sentinel.prev.data;
  }

  set first(value){
    const sentinel = this.@sentinel,
          next = sentinel.next;
    if (sentinel !== next) {
      next.data = value;
    } else if (!this.@items.has(value)) {
      this.@items.set(value, new LinkedElement(value, sentinel));
      this.size++;
    }
    return true;
  }

  set last(value){
    const sentinel = this.@sentinel,
          prev = sentinel.prev;
    if (sentinel !== prev) {
      prev.data = value;
    } else if (!this.@items.has(value)) {
      this.@items.set(value, new LinkedElement(value, prev));
      this.size++;
    }
    return true;
  }

  unshift(...values){
    const len = values.length;
    var i = 0;
    if (len) {
      do {
        if (!this.@items.has(values[i])) {
          this.@items.set(values[i], new LinkedElement(values[i], this.@sentinel));
          this.size++;
        }
      } while (++i < len)
    }
    return this.size;
  }

  push(...values){
    const len = values.length;
    var i = 0;
    if (len) {
      do {
        if (!this.@items.has(values[i])) {
          this.@items.set(values[i], new LinkedElement(values[i], this.@sentinel.prev));
          this.size++;
        }
      } while (++i < len)
    }
    return this.size;
  }

  pop(){
    if (this.size) {
      this.size--;
      this.@items.delete(this.@sentinel.prev);
      return this.@sentinel.prev.unlink().data;
    }
  }

  shift(){
    if (this.size) {
      this.size--;
      this.@items.delete(this.@sentinel.next);
      return this.@sentinel.next.unlink().data;
    }
  }

  insert(value, after){
    const found = this.@items.get(after);
    if (found && !this.@items.has(value)) {
      this.@items.set(value, new LinkedElement(value, found));
      return this.size++;
    }
    return false;
  }

  insertBefore(value, before){
    const found = this.@items.get(before);
    if (found && !this.@items.has(value)) {
      this.@items.set(value, new LinkedElement(value, found.prev));
      return this.size++;
    }
    return false;
  }

  replace(value, replacement){
    const found = this.@items.get(value);
    if (found && !this.@items.has(replacement)) {
      this.@items.set(replacement, new LinkedElement(replacement, found));
      found.unlink();
      this.@items.delete(found);
      return true;
    }
    return false;
  }

  remove(value){
    const found = this.@items.get(value);
    if (found) {
      found.unlink();
      this.@items.delete(found);
      this.size--;
      return true;
    }
    return false;
  }

  has(value) {
    return this.@items.has(value);
  }

  clear(){
    const sentinel = this.@sentinel;
    var found = sentinel.next,
        next = found.next;

    while (found !== sentinel) {
      found.clear();
      found = next;
      next = found.next;
    }

    this.size = 0;
    return this;
  }

  clone(){
    const sentinel = this.@sentinel;
    var found = sentinel,
        list = new LinkedMap;

    while ((found = found.next) !== sentinel) {
      list.push(found.data);
    }
    return list;
  }


  @iterator(){
    return new LinkedMapIterator(this);
  }
}
