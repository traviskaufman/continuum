# Exotic Objects

All of the higher level functions like `DefineOwnProperty`, `GetOwnProperty`, `GetP`, `Enumerate`, `Call`, etc. have many semantics in them that are hard to replicate if you try to replace those functions wholesale with your own implementation. Below these specification functions, continuum uses a simple API that all Object property access and execution eventually goes through. A call to `obj.DefineOwnProperty` will ultimately result in calls to `obj.describe(key)`, `obj.set(key, value)`, and `obj.update(key, attribute)`. These low level functions are responsible for the actual storage and retrieval of the data, once all the preprocessing has been completed by the runtime. To make an exotic object, you can use Continuum's API to make an object with custom callbacks for these low levels functions, making it easy to override and extend.

Below is all most of the functions you can override, and their default implementation. A customized object could either skip some/most of these, could implement completely custom behavior, or could simply augment the normal functionality with some slightly altered behavior. All of these functions operate own *own* properties; the runtime handles inheritance, accessors, etc. These functions are for storing and retrieving data.

* __get(key)__: Return the value for *key*
* __set(key, value)__: If *key* exists in properties update the value. Otherwise, create a new property with *value* and default attrs.
* __query(key)__: Return the attrs for *key*
* __update(key, attrs)__: Set the attrs for *key*. `update` will never be called for non-existent properties
* __remove(key)__: Delete *key* and its property from the object's properties
* __describe(key)__: Return a three element array `[key, value, attrs]`
* __define(key, value, attrs)__: Create or update *key*, setting both *value* and *attrs*
* __has(key)__: Returns boolean whether object's properties has *key*
* __each(callback)__: For each property that object has, call *callback* with a three element array `[key, value, attrs]`

## Property Attributes
Property attributes are a bitmask representing the true/false state of the attribute.

    _ = 0 - empty
    E = 1 - enumerable
    C = 2 - configurable
    W = 4 - writable
    A = 8 - accessor

Thus the normal attr for setting a new property is 7 (`E | C | W`). A hidden property would be 6 (`C | W`). A property should never be `W | A`; this will lead to undefined behavior.

If a property is an accessor then its value should be an object of the shaped `{ Get: func, Set: func }` and it should have the `A` bit set to true. Thus a normal accessor would be 11 (`E | C | A`).

### Attribute Table
For reference, the following are the valid attribute values:

    const ___ =  0, // { enumerable: false, configurable: false, writable: false, value: ... }
          E__ =  1, // { enumerable: true,  configurable: false, writable: false, value: ... }
          _C_ =  2, // { enumerable: false, configurable: true,  writable: false, value: ... }
          EC_ =  3, // { enumerable: true,  configurable: true,  writable: false, value: ... }
          __W =  4, // { enumerable: false, configurable: false, writable: true,  value: ... }
          E_W =  5, // { enumerable: true,  configurable: false, writable: true,  value: ... }
          _CW =  6, // { enumerable: false, configurable: true,  writable: true,  value: ... }
          ECW =  7, // { enumerable: true,  configurable: true,  writable: true,  value: ... }
          __A =  8, // { enumerable: false, configurable: false, get: ..., set: ... }
          E_A =  9, // { enumerable: true,  configurable: false, get: ..., set: ... }
          _CA = 10, // { enumerable: false, configurable: true,  get: ..., set: ... }
          ECA = 11; // { enumerable: true,  configurable: true,  get: ..., set: ... }


The default attribute for *set* is 7 (`ECW`). The default for *define* is 6 (`_CW`).

## Standard builtin functionality
As an example, below is the $Object versions of these functions:

```javascript
var $MyObjectType = continuum.createExotic('Object', [
  // delete a property
  function remove(key){
    return this.properties.remove(key);
  },
  function describe(key){
    // properties are stored as arrays with 3 fields [key, value, attributes]
    // describe is a request for one of these property arrays
    return this.properties.getProperty(key);
  },
  function define(key, value, attrs){
    // define sets both the value and the attributes at the same time
    return this.properties.set(key, value, attrs);
  },
  function has(key){
    // hasOwnProperty
    return this.properties.has(key);
  },
  function each(callback){
    // `each` is the only way the API exposes to get a list of all the properties
    this.properties.forEach(callback, this);
  },
  function get(key){
    // retrieve value
    return this.properties.get(key);
  },
  function set(key, value){
    // store value, using default attributes if property is new
    return this.properties.set(key, value);
  },
  function query(key){
    // retrieve attributes
    return this.properties.getAttribute(key);
  },
  function update(key, attr){
    // store attributes
    return this.properties.setAttribute(key, attr);
  }
]);
```
