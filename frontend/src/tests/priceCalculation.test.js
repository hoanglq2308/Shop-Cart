import { describe, expect, test } from 'vitest'
import {
  calculateOrderPrice,
  checkInventoryAvailability,
} from '../utils/priceCalculation'

describe('Price Calculation Tests', () => {
  test('TC1: Tinh tong gia khong co giam gia', () => {
    const items = [
      { price: 15000000, quantity: 2 },
      { price: 500000, quantity: 1 },
    ]

    const result = calculateOrderPrice(items, null, 50000)

    expect(result.subtotal).toBe(30500000)
    expect(result.discount).toBe(0)
    expect(result.shipping).toBe(50000)
    expect(result.total).toBe(30550000)
  })

  test('TC2: Ap dung coupon giam phan tram', () => {
    const items = [
      { price: 1000000, quantity: 2 },
      { price: 500000, quantity: 1 },
    ]

    const coupon = { type: 'PERCENTAGE', value: 10 }
    const result = calculateOrderPrice(items, coupon, 30000)

    expect(result.subtotal).toBe(2500000)
    expect(result.discount).toBe(250000)
    expect(result.shipping).toBe(30000)
    expect(result.total).toBe(2280000)
  })

  test('TC3: Ap dung coupon giam so tien co dinh', () => {
    const items = [{ price: 1000000, quantity: 1 }]
    const coupon = { type: 'FIXED_AMOUNT', value: 120000 }

    const result = calculateOrderPrice(items, coupon, 15000)

    expect(result.subtotal).toBe(1000000)
    expect(result.discount).toBe(120000)
    expect(result.shipping).toBe(15000)
    expect(result.total).toBe(895000)
  })

  test('TC4: Discount khong duoc vuot qua subtotal', () => {
    const items = [{ price: 200000, quantity: 1 }]
    const coupon = { type: 'FIXED_AMOUNT', value: 500000 }

    const result = calculateOrderPrice(items, coupon, 0)

    expect(result.subtotal).toBe(200000)
    expect(result.discount).toBe(200000)
    expect(result.total).toBe(0)
  })

  test('TC5: Shipping am thi tinh bang 0', () => {
    const items = [{ price: 100000, quantity: 2 }]

    const result = calculateOrderPrice(items, null, -10000)

    expect(result.subtotal).toBe(200000)
    expect(result.shipping).toBe(0)
    expect(result.total).toBe(200000)
  })

  test('TC6: Du lieu item khong hop le se duoc tinh la 0', () => {
    const items = [
      { price: null, quantity: 2 },
      { price: 100000, quantity: undefined },
    ]

    const result = calculateOrderPrice(items, null, 0)

    expect(result.subtotal).toBe(0)
    expect(result.total).toBe(0)
  })

  test('TC7: Coupon khong dung loai thi khong ap dung giam gia', () => {
    const items = [{ price: 500000, quantity: 1 }]
    const coupon = { type: 'UNKNOWN', value: 50 }

    const result = calculateOrderPrice(items, coupon, 20000)

    expect(result.subtotal).toBe(500000)
    expect(result.discount).toBe(0)
    expect(result.total).toBe(520000)
  })
})

describe('Inventory Availability Tests', () => {
  test('TC8: Dat hang hop le khi du ton kho', () => {
    const cartItems = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ]

    const productStocks = [
      { id: 1, stockQuantity: 5 },
      { id: 2, stockQuantity: 1 },
    ]

    const result = checkInventoryAvailability(cartItems, productStocks)

    expect(result.isAvailable).toBe(true)
    expect(result.unavailableItems).toEqual([])
  })

  test('TC9: Bao loi khi so luong vuot qua ton kho', () => {
    const cartItems = [
      { productId: 1, quantity: 8 },
      { productId: 2, quantity: 1 },
    ]

    const productStocks = [
      { id: 1, stockQuantity: 5 },
      { id: 2, stockQuantity: 1 },
    ]

    const result = checkInventoryAvailability(cartItems, productStocks)

    expect(result.isAvailable).toBe(false)
    expect(result.unavailableItems).toHaveLength(1)
    expect(result.unavailableItems[0]).toEqual({
      productId: 1,
      requested: 8,
      available: 5,
    })
  })

  test('TC10: Bao loi khi san pham khong ton tai trong kho', () => {
    const cartItems = [{ productId: 999, quantity: 1 }]
    const productStocks = [{ id: 1, stockQuantity: 5 }]

    const result = checkInventoryAvailability(cartItems, productStocks)

    expect(result.isAvailable).toBe(false)
    expect(result.unavailableItems).toEqual([
      { productId: 999, requested: 1, available: 0 },
    ])
  })

  test('TC11: San pham co stock null se duoc xem la het hang', () => {
    const cartItems = [{ productId: 1, quantity: 1 }]
    const productStocks = [{ id: 1 }]

    const result = checkInventoryAvailability(cartItems, productStocks)

    expect(result.isAvailable).toBe(false)
    expect(result.unavailableItems[0]).toEqual({
      productId: 1,
      requested: 1,
      available: 0,
    })
  })
})
