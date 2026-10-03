import { describe, expect, test } from "vitest";
import { createInfrastructure, defaultConfig, Infrastructure } from "./index";

const config = {
  ...defaultConfig,
  infrastructureUpkeep: { production: 100, extraction: 50 },
  infrastructureDamageRate: 0.2,
  infrastructureRepairRate: 0.1,
};

const plant = createInfrastructure(
  { id: "i1", type: "production", controller: "gov" },
  config,
);

describe("createInfrastructure", () => {
  test("starts intact with a budget equal to its type's requirement", () => {
    expect(plant).toEqual({
      id: "i1",
      type: "production",
      controller: "gov",
      condition: 1,
      upkeepBudget: 100,
    });
  });

  test("keeps a given condition and budget", () => {
    const worn = createInfrastructure(
      { ...plant, condition: 0.5, upkeepBudget: 150 },
      config,
    );
    expect([worn.condition, worn.upkeepBudget]).toEqual([0.5, 150]);
  });

  test.each([0, -0.1, 1.1, Number.NaN])("rejects condition %s", (condition) => {
    expect(() => createInfrastructure({ ...plant, condition }, config)).toThrow(
      "Infrastructure i1 condition must be in (0, 1]",
    );
  });

  test.each([-1, Number.NaN])("rejects upkeep budget %s", (upkeepBudget) => {
    expect(() =>
      createInfrastructure({ ...plant, upkeepBudget }, config),
    ).toThrow("Infrastructure i1 upkeep budget must be at least 0");
  });
});

describe("Infrastructure", () => {
  function tickWith(upkeep: number, condition = 0.5): Infrastructure {
    const item = new Infrastructure({ ...plant, condition }, config);
    item.receive(upkeep);
    item.tick();
    return item;
  }

  test("exposes its fields and its type's upkeep requirement", () => {
    const item = new Infrastructure(plant, config);
    expect(item.id).toBe("i1");
    expect(item.type).toBe("production");
    expect(item.controllerId).toBe("gov");
    expect(item.condition).toBe(1);
    expect(item.upkeepBudget).toBe(100);
    expect(item.upkeepRequirement).toBe(100);
  });

  test("full upkeep leaves its condition unchanged", () => {
    expect(tickWith(100).condition).toBe(0.5);
  });

  test("a shortfall damages it in proportion", () => {
    // 40% short at a damage rate of 0.2.
    expect(tickWith(60).condition).toBeCloseTo(0.5 - 0.2 * 0.4);
  });

  test("an overage repairs it in proportion, up to 1.0", () => {
    // 50% over at a repair rate of 0.1.
    expect(tickWith(150).condition).toBeCloseTo(0.5 + 0.1 * 0.5);
    expect(tickWith(1000, 0.99).condition).toBe(1);
  });

  test("it's destroyed when its condition reaches 0.0", () => {
    const item = tickWith(0, 0.1);
    expect(item.condition).toBe(0);
    expect(item.destroyed).toBe(true);
  });

  test("gets and sets its state", () => {
    const item = new Infrastructure(plant, config);
    const other = { ...plant, controller: "res" };
    item.setState(other);
    expect(item.controllerId).toBe("res");
    expect(item.getState()).toBe(other);
  });
});
