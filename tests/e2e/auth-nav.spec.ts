import { test, expect } from '@playwright/test'

// Prerequisites: `npx convex dev` is running and VITE_CONVEX_URL is set in .env.local.

test('unauthenticated visit redirects to login', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('login form can toggle to sign up', async ({ page }) => {
  await page.goto('/auth/login')
  // The page is server-rendered; wait for hydration before interacting or the
  // click is lost.
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  await page.getByRole('button', { name: /create an account instead/i }).click()
  // Name field only appears in sign-up mode
  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
})

test('sidebar is hidden on the login page', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.getByText('Cedric Masters')).toBeVisible()
  // No Dashboard nav link on login screen
  await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0)
})
