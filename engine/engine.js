var engine = (function(exports){
  "use strict";
  var Emitter = require('./lib/Emitter');
  var inherit = require('./lib/objects').inherit;


  function Engine(){
    Emitter.call(this);
    this.realms = [];
    this.changeRealm(null);
    this.changeContext(null);
  }

  inherit(Engine, Emitter, [
    function addRealm(realm){
      this.realms.push(realm);
    },
    function changeRealm(realm){
      if (realm !== this.activeRealm) {
        if (this.activeRealm) {
          this.activeRealm.active = false;
          this.activeRealm.emit('deactivate');
        }

        this.activeRealm = realm;

        if (realm) {
          this.activeGlobal = realm.global;
          this.activeIntrinsics = realm.intrinsics;
          realm.active = true;
          realm.emit('activate');
        } else {
          this.activeGlobal = null;
          this.activeIntrinsics = null;
        }

        this.emit('realm-change', realm);
      }
    },
    function changeContext(context){
      if (context !== this.activeContext) {
        this.activeContext = context;
        this.emit('context-change', context);
      }
    }
  ]);

  exports.Engine = Engine;
  exports.engine = new Engine;

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
