/**
 * Basic Test Suite
 * Simple tests to verify the testing framework is working
 */

describe("Basic Test Suite", () => {
  test("should run basic tests", () => {
    expect(true).toBe(true);
  });

  test("should test basic math", () => {
    expect(1 + 1).toBe(2);
    expect(5 * 3).toBe(15);
  });

  test("should test array operations", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  test("should test object properties", () => {
    const obj = { name: "Test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj.value).toBe(42);
  });

  test("should test async operations", async () => {
    const promise = Promise.resolve("success");
    await expect(promise).resolves.toBe("success");
  });

  test("should test string operations", () => {
    const str = "Hello World";
    expect(str).toMatch(/Hello/);
    expect(str.length).toBe(11);
  });
});
