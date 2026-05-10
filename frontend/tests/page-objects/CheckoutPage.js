import { expect } from '@playwright/test'

export class CheckoutPage {
  constructor(page) {
    this.page = page
    this.cartBadge = page.getByLabel('Giỏ hàng').locator('span').last()
    this.checkoutBtn = page.getByRole('button', { name: 'Tiến hành thanh toán' })
    this.placeOrderBtn = page.getByRole('button', { name: 'Xác nhận đặt hàng' })
    this.totalDisplay = page.locator('text=/Tổng cộng/').locator('..').locator('span').last()
    this.successMessage = page.getByText('Đặt hàng thành công')
    this.inventoryWarning = page.getByText(/Chỉ còn.*sản phẩm trong kho/)
    this.fullNameInput = page.locator('input[name="fullName"]')
    this.phoneInput = page.locator('input[name="phone"]')
    this.addressInput = page.locator('input[name="address"]')
    this.citySelect = page.locator('select[name="city"]')
    this.districtSelect = page.locator('select[name="district"]')
    this.checkoutForm = page.locator('form#checkout-form')
  }

  async goToCheckout() {
    await this.checkoutBtn.click()
    // Wait for checkout page heading to be visible (state-based navigation)
    await this.page.getByRole('heading', { name: 'Thanh toán' }).waitFor({ timeout: 5000 })
  }

  async fillCustomerInfo(customerData) {
    const { fullName, phone, address, city, district } = customerData
    if (fullName) {
      await this.fullNameInput.fill(fullName)
    }
    if (phone) {
      await this.phoneInput.fill(phone)
    }
    if (address) {
      await this.addressInput.fill(address)
    }
    if (city) {
      await this.citySelect.selectOption(city)
    }
    if (district) {
      await this.districtSelect.selectOption(district)
    }
  }

  async placeOrder() {
    await this.placeOrderBtn.click()
    await this.successMessage.waitFor({ timeout: 5000 })
  }

  async getTotalPrice() {
    return await this.totalDisplay.innerText()
  }

  async expectStockWarning() {
    await expect(this.inventoryWarning).toBeVisible()
  }

  async getCartBadgeCount() {
    const text = (await this.cartBadge.textContent()) ?? '0'
    return Number.parseInt(text.trim(), 10)
  }

  async backToCart() {
    await this.page.getByRole('button', { name: 'LUXE' }).click()
  }
}

export default CheckoutPage
