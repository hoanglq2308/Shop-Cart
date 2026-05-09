import { expect, test } from '@playwright/test'
import { CartPage } from '../page-objects/CartPage'

const productsFixture = [
  {
    id: 1,
    name: 'Màn hình ASUS 24 inch',
    price: 2500000,
    stockQuantity: 50,
    status: 'ACTIVE',
  },
  {
    id: 2,
    name: 'Bàn phím cơ',
    price: 1500000,
    stockQuantity: 1,
    status: 'ACTIVE',
  },
  {
    id: 3,
    name: 'Chuột Gaming',
    price: 500000,
    stockQuantity: 0,
    status: 'ACTIVE',
  },
]

test.describe('Cart E2E flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsFixture),
      })
    })
  })

  test('complete add-to-cart flow', async ({ page }) => {
    const cartPage = new CartPage(page)

    await cartPage.openShop()
    const oldCount = await cartPage.getCartBadgeCount()

    await cartPage.addProductByName('Màn hình ASUS 24 inch')
    await cartPage.expectAddSuccessToast()

    await expect(cartPage.cartBadge).toHaveText(String(oldCount + 1))

    await cartPage.openCart()
    await expect(page.getByRole('button', { name: 'Tiến hành thanh toán' })).toBeVisible()
  })

  test('shows stock validation when exceeding available quantity', async ({ page }) => {
    const cartPage = new CartPage(page)

    await cartPage.openShop()
    await cartPage.openCart()

    const targetProduct = 'Đồng hồ Chronograph Element'
    await cartPage.expectStockWarning(targetProduct, 2)

    await cartPage.increaseQuantityForProduct(targetProduct)
    await cartPage.expectIncreaseDisabledForProduct(targetProduct)

    const quantity = await cartPage.getQuantityForProduct(targetProduct)
    expect(quantity).toBe(2)
  })

  test('prevents adding out-of-stock item from shop view', async ({ page }) => {
    const cartPage = new CartPage(page)

    await cartPage.openShop()

    const unavailableButton = page.getByRole('button', { name: 'Không khả dụng' }).first()
    await expect(unavailableButton).toBeDisabled()
  })
})
