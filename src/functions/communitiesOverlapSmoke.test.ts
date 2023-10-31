/**
 * @jest-environment node
 * @group smoke
 */
import { communitiesOverlap } from "./communitiesOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof communitiesOverlap).toBe("function");
  });
  test("communitiesOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await communitiesOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "communitiesOverlap", example.properties.name);
    }
  }, 120000);
});
