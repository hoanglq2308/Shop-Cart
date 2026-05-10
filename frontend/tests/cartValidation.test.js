import { describe, expect, test } from 'vitest'
import {
  validateCartItem,
  calculateCartTotal,
  validateQuantityUpdate,
} from '../src/utils/cartValidation'

describe('Cart Validation Tests', () => {
  test('TC1: Quantity = 0 - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: 0,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải lớn hơn 0')
  })

  test('TC2: Quantity âm - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: -5,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải lớn hơn 0')
  })

  test('TC3: Quantity = null - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: null,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải lớn hơn 0')
  })

  test('TC4: Quantity = undefined - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: undefined,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải lớn hơn 0')
  })

  test('TC5: Quantity vượt quá stock - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: 15,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng không được vượt quá 10')
  })

  test('TC6: Quantity hợp lệ - nên trả về valid', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: 5,
      stock: 10,
    })

    expect(result.valid).toBe(true)
  })

  test('TC7: Quantity = 1 (min) - nên trả về valid', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: 1,
      stock: 10,
    })

    expect(result.valid).toBe(true)
  })

  test('TC8: Quantity = stock (boundary) - nên trả về valid', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: 10,
      stock: 10,
    })

    expect(result.valid).toBe(true)
  })

  test('TC9: Product ID không hợp lệ - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: null,
      quantity: 5,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Product ID không hợp lệ')
  })

  test('TC10: Quantity không phải số nguyên - nên trả về lỗi', () => {
    const result = validateCartItem({
      productId: 'P001',
      quantity: 2.5,
      stock: 10,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải là số nguyên')
  })
})

describe('Calculate Cart Total Tests', () => {
  test('TC11: Giỏ hàng rỗng - nên trả về 0', () => {
    const result = calculateCartTotal([])

    expect(result.subtotal).toBe(0)
    expect(result.itemCount).toBe(0)
    expect(result.total).toBe(0)
  })

  test('TC12: Giỏ hàng null - nên trả về 0', () => {
    const result = calculateCartTotal(null)

    expect(result.subtotal).toBe(0)
    expect(result.itemCount).toBe(0)
    expect(result.total).toBe(0)
  })

  test('TC13: Tính tổng đúng với 1 sản phẩm', () => {
    const cartItems = [
      {
        product: { price: 1000000 },
        quantity: 2,
      },
    ]

    const result = calculateCartTotal(cartItems)

    expect(result.subtotal).toBe(2000000)
    expect(result.itemCount).toBe(2)
    expect(result.total).toBe(2000000)
  })

  test('TC14: Tính tổng đúng với nhiều sản phẩm', () => {
    const cartItems = [
      {
        product: { price: 1000000 },
        quantity: 2,
      },
      {
        product: { price: 500000 },
        quantity: 1,
      },
      {
        product: { price: 100000 },
        quantity: 3,
      },
    ]

    const result = calculateCartTotal(cartItems)

    expect(result.subtotal).toBe(2800000)
    expect(result.itemCount).toBe(6)
    expect(result.total).toBe(2800000)
  })

  test('TC15: Dữ liệu không hợp lệ được tính là 0', () => {
    const cartItems = [
      {
        product: { price: null },
        quantity: 2,
      },
      {
        product: { price: 500000 },
        quantity: undefined,
      },
    ]

    const result = calculateCartTotal(cartItems)

    expect(result.subtotal).toBe(0)
    expect(result.total).toBe(0)
  })

  test('TC16: Tính tổng sau khi xóa sản phẩm', () => {
    const cartItems = [
      {
        product: { price: 1000000 },
        quantity: 2,
      },
    ]

    const result = calculateCartTotal(cartItems)
    const newResult = calculateCartTotal([])

    expect(result.subtotal).toBe(2000000)
    expect(newResult.subtotal).toBe(0)
  })
})

describe('Validate Quantity Update Tests', () => {
  test('TC17: Update số lượng hợp lệ', () => {
    const result = validateQuantityUpdate(2, 3, 10)

    expect(result.valid).toBe(true)
    expect(result.newQuantity).toBe(3)
  })

  test('TC18: Update số lượng = 0 - nên trả về lỗi', () => {
    const result = validateQuantityUpdate(2, 0, 10)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải lớn hơn 0')
  })

  test('TC19: Update số lượng vượt quá stock - nên trả về lỗi', () => {
    const result = validateQuantityUpdate(2, 15, 10)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng không được vượt quá 10')
  })

  test('TC20: Update số lượng không phải số nguyên - nên trả về lỗi', () => {
    const result = validateQuantityUpdate(2, 2.5, 10)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Số lượng phải là số nguyên')
  })
})
