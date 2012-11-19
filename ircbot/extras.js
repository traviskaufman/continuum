Object.defineProperty(this, 'reset', {
  configurable: true,
  enumerable: false,
  writable: true,
  value(){
    $__Signal('reset');
  }
});
