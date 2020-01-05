import { IState, IStateList, IFrag } from "./main";

export const MATCH_STATE = 257;
export const SPLIT_STATE = 256;
export const matchState = createState(MATCH_STATE);
export const symbols = {
  catenate: ".".charCodeAt(0),
  split: "|".charCodeAt(0),
  zeroOrOne: "?".charCodeAt(0),
  zeroOrMore: "*".charCodeAt(0),
  oneOrMore: "+".charCodeAt(0)
};

/**
 * Utility function to create a postfix expression from a regex, using
 * `.` as a concatenation operator -- e.g. `(ab+)|c` becomes `ab+.c|`.
 */
export function re2post(re: string) {
  let nalt = 0;
  let natom = 0;
  let dest = "";
  let paren = Array(100)
    .fill(null)
    .map(() => ({ nalt: 0, natom: 0 }));
  let i = 0;
  re.split("").forEach(char => {
    switch (char) {
      case "(":
        if (natom > 1) {
          --natom;
          dest += ".";
        }
        paren[i].nalt = nalt;
        paren[i].natom = natom;
        i++;
        nalt = 0;
        natom = 0;
        break;
      case "|":
        if (natom === 0) return null;
        while (--natom > 0) dest += ".";
        nalt++;
        break;
      case ")":
        if (natom === 0) return null;
        while (--natom > 0) dest += ".";
        for (; nalt > 0; nalt--) dest += "|";
        i--;
        nalt = paren[i].nalt;
        natom = paren[i].natom;
        natom++;
        break;
      case "*":
      case "+":
      case "?":
        if (natom === 0) return null;
        dest += char;
        break;
      default:
        if (natom > 1) {
          --natom;
          dest += ".";
        }
        dest += char;
        natom++;
        break;
    }
  });
  while (--natom > 0) dest += ".";
  for (; nalt > 0; nalt--) dest += "|";
  return dest;
}

export function hasMatch(stateList: IState[]) {
  return stateList.some(_ => _.c === MATCH_STATE);
}

export function createState(c: number, out1?: IState, out2?: IState): IState {
  return {
    lastList: 0,
    c,
    out1: { ref: out1 },
    out2: { ref: out2 }
  };
}

export function createFragment(state: IState, stateList: IStateList): IFrag {
  return {
    start: state,
    out: stateList
  };
}

/**
 * Patch the given state into each reference in the statelist --
 * or, connect the dangling arrows represented by each reference in the
 * statelist to the given state.
 */
export function patch(stateList: IStateList, state: IState) {
  stateList.forEach(_ => (_.ref = state));
}
