import { test as setup, expect } from "@playwright/test";
import { deleteAuthUser } from "./helpers/db";
import {
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  TEST_USER_FIRSTNAME,
  TEST_USER_LASTNAME,
  TEST_USER_INITIALS,
} from "./helpers/test-user";

const authFile = "playwright/.auth/user.json";

setup("sign up the test user and save storage state", async ({ page }) => {
  await deleteAuthUser(TEST_USER_EMAIL);

  await page.goto("/");
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  await page.getByLabel("First name").fill(TEST_USER_FIRSTNAME);
  await page.getByLabel("Last name").fill(TEST_USER_LASTNAME);
  await page.getByLabel("Email").fill(TEST_USER_EMAIL);
  await page.getByLabel("Password").fill(TEST_USER_PASSWORD);

  await page.getByRole("button", { name: "Sign up", exact: true }).click();

  await expect(page.getByRole("button", { name: "Account menu" })).toContainText(
    TEST_USER_INITIALS,
  );

  await page.context().storageState({ path: authFile });
});