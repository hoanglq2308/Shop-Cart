import { expect, test } from '@playwright/test'
import { CartPage } from '../page-objects/CartPage'

const authState = {
  currentUserEmail: 'tester@example.com',
  currentUserName: 'Tester User',
  accounts: [
    {
      email: 'tester@example.com',
      name: 'Tester User',
      savedAddress: null,
      orders: [],
    },
  ],
}

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
    name: 'Đồng hồ Chronograph Element',
    price: 1500000,
    stockQuantity: 2,
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
    await page.addInitScript((state) => {
      window.localStorage.setItem('shopcart.currentUserEmail', state.currentUserEmail)
      window.localStorage.setItem('currentUserName', state.currentUserName)
      window.localStorage.setItem('shopcart.accounts', JSON.stringify(state.accounts))
    }, authState)

    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsFixture),
      })
    })

    // Stateful mock cart storage for the test run
    const cartItems = [
      {
        cartItemId: 1,
        productId: productsFixture[1].id,
        productName: productsFixture[1].name,
        imageUrl: '',
        price: productsFixture[1].price,
        quantity: 1,
        stock: productsFixture[1].stockQuantity,
      },
    ]

    await page.route('**/api/cart/add', async (route) => {
      const req = route.request()
      let body = {}
      try {
        body = JSON.parse(req.postData() || '{}')
      } catch (e) {
        body = {}
      }

      const pidRaw = body.productId || ''
      const pid = Number(String(pidRaw).replace(/^P/, ''))
      const qty = Number(body.quantity || 1)

      const prod = productsFixture.find((p) => p.id === pid)
      if (!prod) {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Sản phẩm không tồn tại' }) })
        return
      }

      const existing = cartItems.find((ci) => ci.productId === pid)
      if (existing) {
        existing.quantity += qty
        if (existing.quantity > existing.stock) existing.quantity = existing.stock
      } else {
        cartItems.push({ cartItemId: Date.now(), productId: pid, productName: prod.name, imageUrl: '', price: prod.price, quantity: qty, stock: prod.stockQuantity })
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Thêm vào giỏ hàng thành công' }) })
    })

    await page.route('**/api/cart', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, cartItems, cartTotal: 0 }) })
    })

    await page.route('**/api/cart/*/quantity', async (route) => {
      const req = route.request()
      let body = {}
      try {
        body = JSON.parse(req.postData() || '{}')
      } catch (e) {
        body = {}
      }

      // extract cartItemId from URL
      const url = route.request().url()
      const match = url.match(/\/api\/cart\/(\d+)\/quantity/)
      const cartItemId = match ? Number(match[1]) : null

      const newQty = Number(body.quantity || 0)
      const item = cartItems.find((ci) => ci.cartItemId === cartItemId)
      if (item) {
        item.quantity = Math.min(newQty, item.stock)
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Cập nhật số lượng thành công' }) })
      } else {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Cart item not found' }) })
      }
    })
  })

  test('complete add-to-cart flow', async ({ page }) => {
    const cartPage = new CartPage(page)

    await cartPage.openShop()
    const oldCount = await cartPage.getCartBadgeCount()

    await cartPage.addProductByName('Màn hình ASUS 24 inch')
    await cartPage.expectAddSuccessToast()

    // Badge should increase by at least 1 (allow for race/duplicates in parallel runs)
    const newCount = await cartPage.getCartBadgeCount()
    expect(newCount).toBeGreaterThanOrEqual(oldCount + 1)

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
