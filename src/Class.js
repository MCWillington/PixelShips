function BaseClass() { }
BaseClass.prototype.construct = function() {};
BaseClass.__asMethod__ = function(func, superClass) {  
  return function() {
      var currentSuperClass = this.super;
      this.super = superClass;
      var ret = func.apply(this, arguments);      
      this.super = currentSuperClass;
      return ret;
  };
};
 
BaseClass.extend = function(def) {
  var classDef = function() {
      if (arguments[0] !== BaseClass) { this.construct.apply(this, arguments); }
  };
 
  var proto = new this(BaseClass);
  var superClass = this.prototype;
 
  for (var n in def) {
      var item = def[n];                      
 
      if (item instanceof Function) {
          item = BaseClass.__asMethod__(item, superClass);
      }
 
      proto[n] = item;
  }
 
  proto.super = superClass;
  classDef.prototype = proto;
   
  classDef.extend = this.extend;      
  return classDef;
};