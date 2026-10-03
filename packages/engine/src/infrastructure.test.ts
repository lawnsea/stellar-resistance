import { describe, expect, test } from "vitest";
import { createInfrastructure, Infrastructure } from "./index";

const plant = createInfrastructure({
  id: "i1",
  type: "extraction",
  controller: "res",
});

describe("createInfrastructure", () => {
  test("creates infrastructure of a type, controlled by a faction", () => {
    expect(plant).toEqual({ id: "i1", type: "extraction", controller: "res" });
  });
});

describe("Infrastructure", () => {
  test("exposes its id, type, and controller id", () => {
    const item = new Infrastructure(plant);
    expect(item.id).toBe("i1");
    expect(item.type).toBe("extraction");
    expect(item.controllerId).toBe("res");
  });

  test("gets and sets its state", () => {
    const item = new Infrastructure(plant);
    const other = createInfrastructure({ ...plant, controller: "gov" });
    item.setState(other);
    expect(item.controllerId).toBe("gov");
    expect(item.getState()).toBe(other);
  });
});
