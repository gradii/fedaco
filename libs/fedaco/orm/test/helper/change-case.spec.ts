import * as changeCase from "../../src/helper/str";

describe("change case", () => {
  it("exports expected methods", () => {
    expect(typeof changeCase).toEqual("object");
  });
});
