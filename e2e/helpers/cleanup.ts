import { test } from "@playwright/test";
import { cleanupUserData } from "./db";
import { TEST_USER_EMAIL } from "./test-user";

export function registerCleanup(t: typeof test) {
  t.afterEach(async () => {
    await cleanupUserData(TEST_USER_EMAIL);
  });
}