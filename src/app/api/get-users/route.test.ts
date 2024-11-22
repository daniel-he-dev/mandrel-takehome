import { testApiHandler } from "next-test-api-route-handler"; // Must always be first
import * as appHandler from "./route";

it("GET returns 200", async () => {
  await testApiHandler({
    appHandler,
    test: async ({ fetch }) => {
      const res = await fetch({ method: "GET" });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.length).toBeGreaterThanOrEqual(1);
    },
  });
});
