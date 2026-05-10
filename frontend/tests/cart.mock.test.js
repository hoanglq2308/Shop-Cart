import { beforeEach, describe, expect, test, vi } from 'vitest'
import * as cartService from '../src/services/cartService'

vi.mock('../src/services/cartService')

beforeEach(() => {
  vi.clearAllMocks()
})

async function addToCartFlow(productId, quantity) {
  return cartService.addToCart(productId, quantity)
}

async function removeFromCartFlow(cartItemId) {
  return cartService.removeCartItem(cartItemId)
}

async function updateQuantityFlow(cartItemId, newQuantity) {
  return cartService.updateCartItemQuantity(cartItemId, newQuantity)
}

async function getCartFlow() {
  return cartService.getCart()
}

describe('Cart Mock Tests', () => {
  test('TC1: Mock - Thêm sản phẩm vào giỏ thành công', async () => {
    vi.mocked(cartService.addToCart).mockResolvedValue({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      cartTotal: 15000000,
    })

    const result = await addToCartFlow('P001', 1)

    expect(cartService.addToCart).toHaveBeenCalledTimes(1)
    expect(cartService.addToCart).toHaveBeenCalledWith('P001', 1)
    expect(result.success).toBe(true)
    expect(result.cartTotal).toBe(15000000)
  })

  test('TC2: Mock - Thêm sản phẩm thất bại khi số lượng âm', async () => {
    vi.mocked(cartService.addToCart).mockResolvedValue({
      success: false,
      message: 'Số lượng phải lớn hơn 0',
      cartTotal: 0,
    })

    const result = await addToCartFlow('P001', -1)

    expect(cartService.addToCart).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(false)
  })

  test('TC3: Mock - Thêm sản phẩm thất bại khi hết hàng', async () => {
    vi.mocked(cartService.addToCart).mockResolvedValue({
      success: false,
      message: 'Hết hàng',
      cartTotal: 0,
    })

    const result = await addToCartFlow('P003', 1)

    expect(cartService.addToCart).toHaveBeenCalledWith('P003', 1)
    expect(result.success).toBe(false)
    expect(result.message).toBe('Hết hàng')
  })

  test('TC4: Mock - Thêm sản phẩm thất bại khi vượt tồn kho', async () => {
    vi.mocked(cartService.addToCart).mockResolvedValue({
      success: false,
      message: 'Số lượng yêu cầu vượt quá tồn kho hiện tại',
      cartTotal: 0,
    })

    const result = await addToCartFlow('P001', 100)

    expect(result.success).toBe(false)
    expect(result.message).toContain('vượt quá tồn kho')
  })

  test('TC5: Mock - Xóa sản phẩm khỏi giỏ thành công', async () => {
    vi.mocked(cartService.removeCartItem).mockResolvedValue({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    })

    const result = await removeFromCartFlow(1)

    expect(cartService.removeCartItem).toHaveBeenCalledTimes(1)
    expect(cartService.removeCartItem).toHaveBeenCalledWith(1)
    expect(result.success).toBe(true)
  })

  test('TC6: Mock - Xóa sản phẩm thất bại khi không tìm thấy', async () => {
    vi.mocked(cartService.removeCartItem).mockResolvedValue({
      success: false,
      message: 'Sản phẩm không tồn tại trong giỏ hàng',
    })

    const result = await removeFromCartFlow(999)

    expect(cartService.removeCartItem).toHaveBeenCalledWith(999)
    expect(result.success).toBe(false)
  })

  test('TC7: Mock - Cập nhật số lượng sản phẩm thành công', async () => {
    vi.mocked(cartService.updateCartItemQuantity).mockResolvedValue({
      success: true,
      message: 'Cập nhật số lượng thành công',
      cartTotal: 30000000,
    })

    const result = await updateQuantityFlow(1, 2)

    expect(cartService.updateCartItemQuantity).toHaveBeenCalledTimes(1)
    expect(cartService.updateCartItemQuantity).toHaveBeenCalledWith(1, 2)
    expect(result.success).toBe(true)
    expect(result.cartTotal).toBe(30000000)
  })

  test('TC8: Mock - Cập nhật số lượng thất bại khi số lượng = 0', async () => {
    vi.mocked(cartService.updateCartItemQuantity).mockResolvedValue({
      success: false,
      message: 'Số lượng phải lớn hơn 0',
    })

    const result = await updateQuantityFlow(1, 0)

    expect(result.success).toBe(false)
  })

  test('TC9: Mock - Cập nhật số lượng thất bại khi vượt tồn kho', async () => {
    vi.mocked(cartService.updateCartItemQuantity).mockResolvedValue({
      success: false,
      message: 'Số lượng yêu cầu vượt quá tồn kho hiện tại',
    })

    const result = await updateQuantityFlow(1, 50)

    expect(result.success).toBe(false)
    expect(result.message).toContain('vượt quá tồn kho')
  })

  test('TC10: Mock - Lấy giỏ hàng thành công', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      message: 'Lấy giỏ hàng thành công',
      cartItems: [
        {
          cartItemId: 1,
          productId: 1,
          productName: 'Laptop Dell',
          price: 15000000,
          quantity: 2,
          stock: 10,
          total: 30000000,
        },
      ],
      cartTotal: 30000000,
      itemCount: 2,
    })

    const result = await getCartFlow()

    expect(cartService.getCart).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(true)
    expect(result.cartItems).toHaveLength(1)
    expect(result.cartTotal).toBe(30000000)
  })

  test('TC11: Mock - Lấy giỏ hàng trống', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      message: 'Giỏ hàng trống',
      cartItems: [],
      cartTotal: 0,
      itemCount: 0,
    })

    const result = await getCartFlow()

    expect(result.success).toBe(true)
    expect(result.cartItems).toHaveLength(0)
    expect(result.cartTotal).toBe(0)
  })

  test('TC12: Mock - Verify multiple calls để addToCart', async () => {
    vi.mocked(cartService.addToCart).mockResolvedValue({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      cartTotal: 15000000,
    })

    await addToCartFlow('P001', 1)
    await addToCartFlow('P002', 1)
    await addToCartFlow('P001', 1)

    expect(cartService.addToCart).toHaveBeenCalledTimes(3)
    expect(cartService.addToCart).toHaveBeenNthCalledWith(1, 'P001', 1)
    expect(cartService.addToCart).toHaveBeenNthCalledWith(2, 'P002', 1)
    expect(cartService.addToCart).toHaveBeenNthCalledWith(3, 'P001', 1)
  })

  test('TC13: Mock - Verify không được gọi khi có error', async () => {
    vi.mocked(cartService.addToCart).mockResolvedValue({
      success: false,
      message: 'Hết hàng',
    })

    await addToCartFlow('P003', 1)

    expect(cartService.removeCartItem).not.toHaveBeenCalled()
  })
})
