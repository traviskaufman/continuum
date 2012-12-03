## Exotic Objects

All of the higher level functions like `DefineOwnProperty`, `GetOwnProperty`, `GetP`, `Enumerate`, `Call`, etc. have many semantics in them that are hard to replicate if you try to replace those functions wholesale with your own implementation. Below these specification functions, continuum uses a simple API that all Object property access and execution eventually goes through. A call to `obj.GetOwnProperty` will ultimately result in calls to `obj.describe(key)`, `obj.set(key, value)`, and `obj.update(key, attribute)`. These low level functions are responsible for the actual storage and retrieval of the data, once all the preprocessing has been completed by the runtime. To make an exotic object, you can use Continuum's API to make an object with custom callbacks for these low levels functions, making it easy to override and extend.

Below is all most of the functions you can override, and their default implementation. A customized object could either skip some/most of these, could implement completely custom behavior, or could simply augment the normal functionality with some slightly altered behavior

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
