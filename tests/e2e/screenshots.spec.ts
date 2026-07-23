import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'test@t.com'
const ADMIN_PASSWORD = 'password'

async function login(page: any) {
  await page.goto('/auth/login')
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible({ timeout: 15000 })
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({ timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

test.describe('Screenshots for User Manual', () => {
  test('01 - Login page', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible({ timeout: 15000 })
    await page.screenshot({ path: 'screenshots/01-login.png', fullPage: true })
  })

  test('02 - Dashboard', async ({ page }) => {
    await login(page)
    await page.screenshot({ path: 'screenshots/02-dashboard.png', fullPage: true })
  })

  test('03 - Appointments', async ({ page }) => {
    await login(page)
    await page.goto('/service/appointments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/03-appointments.png', fullPage: true })
  })

  test('04 - Customers list', async ({ page }) => {
    await login(page)
    await page.goto('/service/customers')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/04-customers.png', fullPage: true })
  })

  test('05 - Jobs list', async ({ page }) => {
    await login(page)
    await page.goto('/service/jobs')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/05-jobs.png', fullPage: true })
  })

  test('06 - Job detail', async ({ page }) => {
    await login(page)
    await page.goto('/service/jobs')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const firstJobLink = page.locator('table a').first()
    if (await firstJobLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstJobLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
    }
    await page.screenshot({ path: 'screenshots/06-job-detail.png', fullPage: true })
  })

  test('07 - Check-in flow', async ({ page }) => {
    await login(page)
    await page.goto('/service/checkin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/07-checkin.png', fullPage: true })
  })

  test('08 - Customer Vehicles', async ({ page }) => {
    await login(page)
    await page.goto('/service/vehicles')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/08-vehicles.png', fullPage: true })
  })

  test('09 - Parts catalogue', async ({ page }) => {
    await login(page)
    await page.goto('/service/parts')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/09-parts.png', fullPage: true })
  })

  test('10 - Finance', async ({ page }) => {
    await login(page)
    await page.goto('/service/finance')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/10-finance.png', fullPage: true })
  })

  test('11 - Sales Inventory', async ({ page }) => {
    await login(page)
    await page.goto('/sales/inventory')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/11-sales-inventory.png', fullPage: true })
  })

  test('12 - Sales Leads', async ({ page }) => {
    await login(page)
    await page.goto('/sales/leads')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/12-sales-leads.png', fullPage: true })
  })

  test('13 - Sales Orders', async ({ page }) => {
    await login(page)
    await page.goto('/sales/orders')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/13-sales-orders.png', fullPage: true })
  })

  test('14 - User Management', async ({ page }) => {
    await login(page)
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/14-user-management.png', fullPage: true })
  })
})
