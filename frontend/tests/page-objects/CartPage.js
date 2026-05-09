import { expect } from '@playwright/test'

export class CartPage {
  constructor(page) {
    this.page = page
    this.cartBadge = page.getByLabel('Giỏ hàng').locator('span').last()
    this.addToCartButtons = page.getByRole('button', { name: 'Thêm vào giỏ' })
    this.cartHeading = page.getByRole('heading', { name: 'Giỏ hàng' })
  }

  async openShop() {
    await this.page.goto('/')
    await expect(this.page.getByText('Bộ sưu tập tuyển chọn')).toBeVisible()
  }

  async openCart() {
    await this.page.getByLabel('Giỏ hàng').click()
    await expect(this.cartHeading).toBeVisible()
  }

  async getCartBadgeCount() {
    const text = (await this.cartBadge.textContent()) ?? '0'
    return Number.parseInt(text.trim(), 10)
  }

  async addFirstAvailableProduct() {
    await this.addToCartButtons.first().click()
  }

  async addProductByName(productName) {
    const card = this.page.locator('article', {
      has: this.page.getByRole('heading', { name: productName }),
    })

    await card.getByRole('button', { name: 'Thêm vào giỏ' }).click()
  }

  async expectAddSuccessToast() {
    await expect(this.page.getByText('Đã thêm vào giỏ')).toBeVisible()
  }

  async getQuantityForProduct(productName) {
    const row = this.page.locator('div.relative.flex.flex-col.gap-4', {
      has: this.page.getByRole('heading', { name: productName }),
    })

    const quantityCell = row.locator('div.flex.h-full.flex-grow.items-center.justify-center.border-x.border-zinc-300.text-sm.font-medium.text-zinc-900')
    const text = (await quantityCell.textContent()) ?? '0'
    return Number.parseInt(text.trim(), 10)
  }

  async increaseQuantityForProduct(productName) {
    const row = this.page.locator('div.relative.flex.flex-col.gap-4', {
      has: this.page.getByRole('heading', { name: productName }),
    })

    await row.getByLabel('Tăng số lượng').click()
  }

  async expectIncreaseDisabledForProduct(productName) {
    const row = this.page.locator('div.relative.flex.flex-col.gap-4', {
      has: this.page.getByRole('heading', { name: productName }),
    })

    await expect(row.getByLabel('Tăng số lượng')).toBeDisabled()
  }

  async expectStockWarning(productName, stock) {
    const row = this.page.locator('div.relative.flex.flex-col.gap-4', {
      has: this.page.getByRole('heading', { name: productName }),
    })

    await expect(row.getByText(`Chỉ còn ${stock} sản phẩm trong kho!`)).toBeVisible()
  }
}
