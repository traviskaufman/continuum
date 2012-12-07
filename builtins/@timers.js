export function clearInterval(id){
  id = $__ToInteger(id);
  $__ClearTimer(id);
}

builtinFunction(clearInterval);


export function clearTimeout(id){
  id = $__ToInteger(id);
  $__ClearTimer(id);
}

builtinFunction(clearTimeout);


export function setInterval(callback, milliseconds){
  milliseconds = $__ToInteger(milliseconds);
  if (typeof callback !== 'function') {
    callback = $__ToString(callback);
  }
  return $__SetTimer(callback, milliseconds, true);
}

builtinFunction(setInterval);


export function setTimeout(callback, milliseconds){
  milliseconds = $__ToInteger(milliseconds);
  if (typeof callback !== 'function') {
    callback = $__ToString(callback);
  }
  return $__SetTimer(callback, milliseconds, false);
}

builtinFunction(setTimeout);
