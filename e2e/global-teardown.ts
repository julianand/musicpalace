import { deleteUsersByPrefix } from "./helpers/db";
import { TEST_USER_EMAIL_PREFIX } from "./helpers/test-user";

export default async function globalTeardown() {
  try {
    await deleteUsersByPrefix(TEST_USER_EMAIL_PREFIX);
  } catch (error) {
    console.error("globalTeardown: failed to clean up e2e users:", error);
  }
}