export default {
  interpretCodes(code) {
    switch (code) {
      case 101:
        return "set text";
      case 401:
        return "show text";

      case 102:
        return "begin case";
      case 402:
        return "when";
      case 403:
        return "otherwise";
      case 0:
        return "nop";
      case 404:
        return "end case";

      case 103:
        return "input numbers";

      case 104:
        return "select item";

      case 105:
        return "scrolling texts";
      case 405:
        return "scrolling textline";

      case 121:
        return "set switches";
      case 122:
        return "set variables";
      case 123:
        return "set self switch";
      case 124:
        return "set timer";

      case 111:
        return "begin if";
      case 411:
        return "else";
      case 412:
        return "end if";
      case 112:
        return "loop";
      case 113:
        return "loop break";
      case 115:
        return "exit event";
      case 117:
        return "common event";
      case 118:
        return "labeling";
      case 119:
        return "jump";
      case 108:
        return "comment";

      case 125:
        return "set gold";
      case 126:
        return "set items";
      case 127:
        return "set weapons";
      case 128:
        return "set armors";
      case 129:
        return "set party member";

      case 311:
        return "set HP";
      case 312:
        return "set MP";
      case 326:
        return "set TP";
      case 313:
        return "set buffs";
      case 314:
        return "heal all";
      case 315:
        return "set EXP";
      case 316:
        return "set LV";
      case 317:
        return "set Param";
      case 318:
        return "set Skill";
      case 319:
        return "set Equipments";
      case 320:
        return "set Name";
      case 321:
        return "set Class";
      case 324:
        return "set Nickname";
      case 325:
        return "set Profile";

      case 201:
        return "set coord";
      case 202:
        return "set vehicle coord";
      case 203:
        return "set event coord";
      case 204:
        return "scroll map";
      case 205:
        return "set movement route";
      case 206:
        return "toggle vehicle";

      default:
        return "";
    }
  },
};
