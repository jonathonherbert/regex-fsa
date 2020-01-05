import {
  testRegex,
  createState,
  patch
} from "./main";

describe("patch", () => {
  it("should patch the given state into every state in the list", () => {
    const list = [{ ref: undefined }, { ref: undefined }];
    const newState = createState(1);
    patch(list, newState);
    expect(list[0].ref).toBe(newState);
    expect(list[1].ref).toBe(newState);
  });
});

describe("addTokenToStack", () => {
  describe("catenate", () => {
    it("should combine the last two fragments together, creating a new fragment that links the two fragments by joining the out list in the first fragment with the start state in the second.", () => {});
  });
});

describe("testRegex", () => {
  it("should match regular expressions made of characters", () => {
    expect(testRegex("b", "b")).toBe(true);
    expect(testRegex("abb", "abb")).toBe(true);
    expect(testRegex("aa", "aabb")).toBe(false);
    expect(testRegex("ab", "aabb")).toBe(false);
  });
  it("should match regular expressions with a split operator", () => {
    expect(testRegex("a|b", "a")).toBe(true);
    expect(testRegex("a|b", "b")).toBe(true);
    expect(testRegex("a|b", "c")).toBe(false);
    expect(testRegex("ab|cd", "ab")).toBe(true);
    expect(testRegex("ab|cd", "cd")).toBe(true);
    expect(testRegex("ab|df", "cd")).toBe(false);
  });
  it("should match regular expressions with a zero-or-one operator", () => {
    expect(testRegex("ab?", "a")).toBe(true);
    expect(testRegex("ab?", "ab")).toBe(true);
    expect(testRegex("ab?c", "ac")).toBe(true);
    expect(testRegex("ab?c", "abc")).toBe(true);
    expect(testRegex("ab?c", "bc")).toBe(false);
    expect(testRegex("ab?c", "ab")).toBe(false);
  });
  it("should match regular expressions with a zero-or-more operator", () => {
    expect(testRegex("ab*", "ab")).toBe(true);
    expect(testRegex("ab*", "abbbbb")).toBe(true);
    expect(testRegex("ab*c", "abbc")).toBe(true);
    expect(testRegex("ab*c", "ac")).toBe(true);
    expect(testRegex("ab*c", "abbbb")).toBe(false);
  });
  it("should match regular expressions with a one-or-more operator", () => {
    expect(testRegex("ab+", "ab")).toBe(true);
    expect(testRegex("ab+", "abbbbb")).toBe(true);
    expect(testRegex("ab+c", "abbc")).toBe(true);
    expect(testRegex("ab+c", "ac")).toBe(false);
    expect(testRegex("ab+c", "abbbb")).toBe(false);
  });
});
