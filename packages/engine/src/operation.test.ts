import { describe, expect, test } from "vitest";
import { createOperation, Operation } from "./index";

const build = createOperation({
  id: "c1-op-1",
  type: "build",
  target: "r1-infra-1",
  initialCost: 100,
  duration: 3,
  perTickCost: 50,
});

describe("createOperation", () => {
  test("creates an operation that hasn't started", () => {
    expect(build).toEqual({
      id: "c1-op-1",
      type: "build",
      target: "r1-infra-1",
      initialCost: 100,
      duration: 3,
      perTickCost: 50,
      progress: 0,
    });
  });

  test.each([
    [{ initialCost: -1 }, "initial cost must be at least 0"],
    [{ perTickCost: Number.NaN }, "per-tick cost must be at least 0"],
    [{ duration: 0 }, "duration must be a positive number"],
    [{ progress: 4 }, "progress must be in [0, 3]"],
    [{ progress: -1 }, "progress must be in [0, 3]"],
  ])("rejects %o", (fields, message) => {
    expect(() => createOperation({ ...build, ...fields })).toThrow(
      `Operation c1-op-1 ${message}`,
    );
  });
});

describe("Operation", () => {
  function tickWith(payment: number, progress = 0): Operation {
    const operation = new Operation({ ...build, progress });
    operation.receive(payment);
    operation.tick();
    return operation;
  }

  test("exposes its fields", () => {
    const operation = new Operation(build);
    expect(operation.id).toBe("c1-op-1");
    expect(operation.type).toBe("build");
    expect(operation.target).toBe("r1-infra-1");
    expect(operation.initialCost).toBe(100);
    expect(operation.duration).toBe(3);
    expect(operation.perTickCost).toBe(50);
    expect(operation.progress).toBe(0);
    expect(operation.done).toBe(false);
    expect(operation.cell).toBeUndefined();
  });

  test("a tick paid in full advances it one tick", () => {
    expect(tickWith(50).progress).toBe(1);
  });

  test("a tick paid in part advances it by the share paid", () => {
    expect(tickWith(20).progress).toBeCloseTo(0.4, 6);
    expect(tickWith(0).progress).toBe(0);
  });

  test("it's done when its progress reaches its duration", () => {
    const operation = tickWith(500, 2.5);
    expect(operation.progress).toBe(3);
    expect(operation.done).toBe(true);
  });

  test("an operation with no per-tick cost advances every tick", () => {
    const operation = new Operation({ ...build, perTickCost: 0 });
    operation.receive(0);
    operation.tick(2);
    expect(operation.progress).toBe(2);
  });

  test("gets and sets its state", () => {
    const operation = new Operation(build);
    const other = { ...build, progress: 2 };
    operation.setState(other);
    expect(operation.getState()).toBe(other);
  });
});
