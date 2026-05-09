import { beforeEach, describe, expect, test, vi } from 'vitest'
import * as orderService from '../src/services/orderService'
import * as inventoryService from '../src/services/inventoryService'

vi.mock('../src/services/orderService')
vi.mock('../src/services/inventoryService')

beforeEach(() => {
  vi.clearAllMocks()
})

async function purchaseFlow(items) {
  const stockResult = await inventoryService.checkStock(items)

  if (!stockResult.available) {
    throw new Error('OUT_OF_STOCK')
  }

  return orderService.createOrder({
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  })
}

describe('Purchase Mock Tests', () => {
  test('Mock: Dat hang thanh cong', async () => {
    const items = [
      { productId: 'P001', price: 15000000, quantity: 2 },
      { productId: 'P002', price: 500000, quantity: 1 },
    ]

    vi.mocked(inventoryService.checkStock).mockResolvedValue({ available: true })
    vi.mocked(orderService.createOrder).mockResolvedValue({
      orderId: 'ORD-001',
      status: 'PENDING',
      totalPrice: 30550000,
    })

    const result = await purchaseFlow(items)

    expect(inventoryService.checkStock).toHaveBeenCalledTimes(1)
    expect(inventoryService.checkStock).toHaveBeenCalledWith(items)
    expect(orderService.createOrder).toHaveBeenCalledTimes(1)
    expect(orderService.createOrder).toHaveBeenCalledWith({
      items,
      total: 30500000,
    })
    expect(result).toEqual({
      orderId: 'ORD-001',
      status: 'PENDING',
      totalPrice: 30550000,
    })
  })

  test('Mock: Het hang thi khong tao don hang', async () => {
    const items = [{ productId: 'P003', price: 1000000, quantity: 1 }]

    vi.mocked(inventoryService.checkStock).mockResolvedValue({
      available: false,
      unavailableItems: [{ productId: 'P003', requested: 1, available: 0 }],
    })

    await expect(purchaseFlow(items)).rejects.toThrow('OUT_OF_STOCK')

    expect(inventoryService.checkStock).toHaveBeenCalledTimes(1)
    expect(orderService.createOrder).not.toHaveBeenCalled()
  })
})