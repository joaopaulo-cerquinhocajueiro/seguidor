module.exports = {
  load: function(rt) {
    var _plusX, _readBatteryMillivolts, type, typeSig;
    type = rt.newClass("OrangutanAnalog2", [
      {
        name: "x",
        t: rt.intTypeLiteral,
        initialize: function(rt,
      _this) {
          return rt.val(rt.intTypeLiteral,
      2,
      true);
        }
      },
      {
        name: "y",
        t: rt.intTypeLiteral,
        initialize: function(rt,
      _this) {
          return rt.val(rt.intTypeLiteral,
      -2,
      true);
        }
      }
    ]);
    typeSig = rt.getTypeSignature(type);
    rt.types[typeSig]["#father"] = "object";
    _plusX = function(rt, _this, a) {
      var newValue;
      newValue = _this.v.members["x"].v + a.v;
      return rt.val(rt.intTypeLiteral, newValue, false);
    };
    _readBatteryMillivolts = function(rt, _this) {
      return rt.val(rt.intTypeLiteral, 0, false);
    };
    rt.regFunc(_plusX, type, "plusX", [rt.intTypeLiteral], rt.intTypeLiteral);
    return rt.regFunc(_readBatteryMillivolts, type, "readBatteryMillivolts", [], rt.intTypeLiteral);
  }
};
