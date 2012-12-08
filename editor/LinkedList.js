import { iterator, Iterator } from '@iter';
symbol @iterator = iterator;
private @sentinel;

class LinkedListIterator extends Iterator {
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


export class LinkedList {
  private @found, @find;

  constructor(iterable){
    this.size = 0;
    this.@sentinel = new Sentinel;
    this.@found = null;
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
    } else {
      new LinkedElement(value, sentinel);
    }
    return true;
  }

  set last(value){
    const sentinel = this.@sentinel,
          prev = sentinel.prev;
    if (sentinel !== prev) {
      prev.data = value;
    } else {
      new LinkedElement(value, prev);
    }
    return true;
  }

  unshift(...values){
    const len = values.length;
    var i = 0;
    if (len) {
      do {
        new LinkedElement(values[i], this.@sentinel);
      } while (++i < len)
    }
    this.size += len;
    return this.size;
  }

  push(...values){
    const len = values.length;
    var i = 0;
    if (len) {
      do {
        new LinkedElement(values[i], this.@sentinel.prev);
      } while (++i < len)
    }
    this.size += len;
    return this.size;
  }

  insert(value, after){
    const found = this.@find(after);
    if (found) {
      new LinkedElement(value, found);
      return this.size++;
    }
    return false;
  }

  insertBefore(value, before){
    const found = this.@find(before);
    if (found) {
      new LinkedElement(value, found.prev);
      return this.size++;
    }
    return false;
  }

  replace(value, replacement){
    const found = this.@find(value);
    if (found) {
      new LinkedElement(replacement, found);
      found.unlink();
      return true;
    }
    return false;
  }

  pop(){
    if (this.size) {
      this.size--;
      return this.@sentinel.prev.unlink().data;
    }
  }

  shift(){
    if (this.size) {
      this.size--;
      return this.@sentinel.next.unlink().data;
    }
  }

  remove(value){
    const found = this.@find(value);
    if (found) {
      found.unlink();
      return true;
    }
    return false;
  }

  has(value) {
    return !!this.@find(value);
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

    this.@found = null;
    this.size = 0;
    return this;
  }

  clone(){
    const sentinel = this.@sentinel;
    var found = sentinel,
        list = new LinkedList;

    while ((found = found.next) !== sentinel) {
      list.push(found.data);
    }
    return list;
  }

  slice(){

  }

  @find(value){
    var found = this.@found;
    if (found && found.data === value) {
      return found;
    }

    const sentinel = this.@sentinel;
    var i = 0;

    found = sentinel;

    while ((found = found.next) !== sentinel) {
      if (found.data === value) {
        return this.@found = found;
      }
    }
  }

  @iterator(){
    return new LinkedListIterator(this);
  }
}
