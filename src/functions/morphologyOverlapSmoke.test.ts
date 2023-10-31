/**
 * @jest-environment node
 * @group smoke
 */
import { morphologyOverlap } from "./morphologyOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof morphologyOverlap).toBe("function");
  });
  test("morphologyOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await morphologyOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "morphologyOverlap", example.properties.name);
    }
  }, 120000);
});
