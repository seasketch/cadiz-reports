/**
 * @jest-environment node
 * @group smoke
 */
import { seagrassOverlap } from "./seagrassOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof seagrassOverlap).toBe("function");
  });
  test("seagrassOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await seagrassOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "seagrassOverlap", example.properties.name);
    }
  }, 120000);
});
