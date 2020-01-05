import {
  re2post,
  SPLIT_STATE,
  matchState,
  hasMatch,
  createState,
  createFragment,
  symbols,
  patch
} from "./util";

export interface IState {
  c: number;
  out1: IStateRef;
  out2: IStateRef;
}

// In Cox's example, written in C, he uses pointers to maintain
// references to null states. In Javascript, we must create a wrapper
// object to achieve the same effect.
export interface IStateRef {
  ref: IState | undefined;
}

export interface IFrag {
  start: IState;
  out: IStateList;
}

export type IStateList = IStateRef[];

export function createNFAFromPostfixExpr(postExpr: string): IState | undefined {
  const stack = postExpr
    .split("")
    .map(_ => _.charCodeAt(0))
    .reduce((acc, char) => addFragmentToStack(char, acc), [] as IFrag[]);

  // patch last fragment to the match state
  const lastFrag = stack.pop();
  if (lastFrag) {
    patch(lastFrag.out, matchState);
  }

  return lastFrag?.start;
}

export function testRegex(re: string, test: string) {
  // Create an NFA from a regular expression in postfix form.
  const postExpr = re2post(re);
  const nfa = createNFAFromPostfixExpr(postExpr);
  if (!nfa) {
    throw new Error("Could not create NFA");
  }

  const testArr = test.split("");

  // Maintain a list of states.
  // If any states are matches, yield the match.
  // if the list of states is empty, there is no match.
  const states = testArr.reduce(
    (acc, char) => getNextStates(acc, char),
    addState([], nfa)
  );
  return hasMatch(states);
}

/**
 * Get the next list of states from the given list of states, moving each of the current
 * states on by one operation in parallel.
 */
export function getNextStates(states: IState[], char: string): IState[] {
  const charCode = char.charCodeAt(0);
  return states.reduce((acc, state) => {
    return state.c === charCode ? addState(acc, state.out1.ref) : acc;
  }, [] as IState[]);
}

export function addState(stateList: IState[], state?: IState): IState[] {
  if (!state) {
    return stateList;
  }
  if (state.c === SPLIT_STATE) {
    return addState(addState(stateList, state.out1.ref), state.out2.ref);
  }
  return [...stateList, state];
}

export function addFragmentToStack(char: number, stack: IFrag[]): IFrag[] {
  switch (char) {
    case symbols.catenate: {
      const frag1 = stack[stack.length - 2];
      const frag2 = stack[stack.length - 1];
      patch(frag1.out, frag2.start);
      const newStack = [
        ...stack.slice(0, stack.length - 2),
        createFragment(frag1.start, frag2.out)
      ];
      return newStack;
    }
    case symbols.split: {
      const frag1 = stack[stack.length - 2];
      const frag2 = stack[stack.length - 1];
      const newState = createState(SPLIT_STATE, frag1.start, frag2.start);
      const newStack = [
        ...stack.slice(0, stack.length - 2),
        createFragment(newState, [...frag1.out, ...frag2.out])
      ];
      return newStack;
    }
    case symbols.zeroOrOne: {
      const frag = stack[stack.length - 1];
      const newState = createState(SPLIT_STATE, frag.start);
      const newStack = [
        ...stack.slice(0, stack.length - 1),
        createFragment(newState, [...frag.out, newState.out2])
      ];
      return newStack;
    }
    case symbols.zeroOrMore: {
      const frag = stack[stack.length - 1];
      const newState = createState(SPLIT_STATE, frag.start);
      patch(frag.out, newState);
      const newStack = [
        ...stack.slice(0, stack.length - 1),
        createFragment(newState, [newState.out2])
      ];
      return newStack;
    }
    case symbols.oneOrMore: {
      const frag = stack[stack.length - 1];
      const newState = createState(SPLIT_STATE, frag.start);
      patch(frag.out, newState);
      const newStack = [
        ...stack.slice(0, stack.length - 1),
        createFragment(frag.start, [newState.out2])
      ];
      return newStack;
    }
    default: {
      const state = createState(char);
      return [...stack, createFragment(state, [state.out1])];
    }
  }
}
