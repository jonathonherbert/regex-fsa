import { re2post } from "./util";

describe("re2post", () => {
	it("should convert regex operators into postfix format", () => {
	  expect(re2post("aabb|aabb")).toEqual("aa.b.b.aa.b.b.|");
	});
  });
  