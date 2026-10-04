import { describe, expect, test } from "vitest";
import { createInfrastructure, defaultConfig, Infrastructure } from "./index";

const config = {
  ...defaultConfig,
  infrastructureUpkeep: { production: 100, extraction: 50 },
  neglectEfficiency: 0.2,
  repairEfficiency: 0.2,
  destructionThreshold: 0.05,
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
      progress: 1,
      constructionBudget:
        defaultConfig.infrastructureConstructionBudget.production,
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

  test("upkeep matching its condition leaves its condition unchanged", () => {
    expect(tickWith(50).condition).toBe(0.5);
  });

  test("upkeep below its condition damages it by a share of the gap", () => {
    // 30% of the requirement against a condition of 0.5.
    expect(tickWith(30).condition).toBeCloseTo(0.5 - 0.2 * (0.5 - 0.3), 6);
  });

  test("upkeep above its condition repairs it by a share of the gap", () => {
    // 200 of 100 against a condition of 0.5: (2 - 0.5) × 0.2 = 0.3.
    expect(tickWith(200).condition).toBeCloseTo(0.8, 6);
  });

  test("repair stops at 1.0", () => {
    expect(tickWith(1000, 0.9).condition).toBe(1);
  });

  test("full upkeep repairs damage", () => {
    expect(tickWith(100).condition).toBeCloseTo(0.5 + 0.2 * 0.5, 6);
  });

  test("its condition approaches the share of upkeep paid", () => {
    const item = new Infrastructure(plant, config);
    for (let i = 0; i < 100; i++) {
      item.receive(50);
      item.tick();
    }
    expect(item.condition).toBeCloseTo(0.5, 6);
  });

  test("it's destroyed when its condition falls below the threshold", () => {
    // 0.06 − 0.2 × 0.06 = 0.048.
    expect(tickWith(0, 0.06).destroyed).toBe(true);
    expect(
      new Infrastructure({ ...plant, condition: 0.05 }, config).destroyed,
    ).toBe(false);
  });

  test("gets and sets its state", () => {
    const item = new Infrastructure(plant, config);
    const other = { ...plant, controller: "res" };
    item.setState(other);
    expect(item.controllerId).toBe("res");
    expect(item.getState()).toBe(other);
  });
});

describe("Infrastructure under construction", () => {
  const building = {
    ...config,
    infrastructureCost: { production: 400, extraction: 400 },
  };

  function project(progress: number, fields = {}): Infrastructure {
    return new Infrastructure(
      createInfrastructure(
        { ...plant, progress, constructionBudget: 100, ...fields },
        building,
      ),
      building,
    );
  }

  test("createInfrastructure defaults to built, with its type's construction budget", () => {
    const item = createInfrastructure({
      id: "i1",
      type: "extraction",
      controller: "res",
    });
    expect(item.progress).toBe(1);
    expect(item.constructionBudget).toBe(
      defaultConfig.infrastructureConstructionBudget.extraction,
    );
  });

  test.each([-0.1, 1.1, Number.NaN])("rejects progress %s", (progress) => {
    expect(() => createInfrastructure({ ...plant, progress }, config)).toThrow(
      "Infrastructure i1 progress must be in [0, 1]",
    );
  });

  test.each([-1, Number.NaN])(
    "rejects construction budget %s",
    (constructionBudget) => {
      expect(() =>
        createInfrastructure({ ...plant, constructionBudget }, config),
      ).toThrow("Infrastructure i1 construction budget must be at least 0");
    },
  );

  test("asks for its construction budget, up to the remaining cost", () => {
    expect(project(0).built).toBe(false);
    expect(project(0).budget).toBe(100);
    // 400 × (1 − 0.875) = 50 left.
    expect(project(0.875).budget).toBe(50);
    expect(project(1).budget).toBe(100);
    expect(project(1, { upkeepBudget: 70 }).budget).toBe(70);
  });

  test("payment adds to progress until it's built", () => {
    const item = project(0.5);
    item.receive(100);
    item.tick();
    expect(item.progress).toBeCloseTo(0.75, 6);
    item.receive(100);
    item.tick();
    expect(item.progress).toBe(1);
    expect(item.built).toBe(true);
  });

  test("its condition doesn't change and it isn't destroyed while under construction", () => {
    const item = project(0.5, { condition: 0.01 });
    item.receive(0);
    item.tick();
    expect(item.condition).toBe(0.01);
    expect(item.destroyed).toBe(false);
  });
});
