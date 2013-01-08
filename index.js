var continuum = module.exports = require('./engine');

continuum.createRealm = function createRealm(callback){
  return new continuum.Realm(callback).useConsole(console);
};

continuum.createRealmAsync = function createRealmAsync(){
  return new continuum.Realm(true).useConsole(console);
};
