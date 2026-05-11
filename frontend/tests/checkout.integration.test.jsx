import { afterEach, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import OrderSummary from '../src/components/OrderSummary'
import CheckoutPage from '../src/page/CheckoutPage'
import { LoadingProvider } from '../src/components/LoadingProvider'
import { ToastProvider } from '../src/components/ToastProvider'

vi.mock('../src/services/orderService', () => ({
  createOrder: vi.fn(),
}))

import { createOrder } from '../src/services/orderService'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function rowValue(labelText) {
  const label = screen.getByText(labelText)
  return label.parentElement?.children[1]?.textContent?.replace(/\s+/g, ' ').trim()
}

function renderWithProviders(ui) {
  return render(
    <LoadingProvider>
      <ToastProvider>{ui}</ToastProvider>
    </LoadingProvider>,
  )
}

describe('Checkout integration tests', () => {
  test('OrderSummary renders totals, applies coupon, and triggers checkout', () => {
    const handleCheckout = vi.fn()

    render(<OrderSummary subtotal={2500000} onCheckout={handleCheckout} />)

    expect(rowValue('Tạm tính')).toBe('2.500.000 đ')
    expect(rowValue('Phí vận chuyển')).toBe('15.000 đ')
    expect(rowValue('Tổng cộng')).toBe('2.515.000 đ')

    fireEvent.change(screen.getByLabelText('Bạn có mã giảm giá?'), {
      target: { value: 'welcome50' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }))

    return waitFor(() => {
      expect(rowValue('Tổng cộng')).toBe('2.465.000 đ')
    })

    fireEvent.click(screen.getByRole('button', { name: /Tiến hành thanh toán/i }))
    expect(handleCheckout).toHaveBeenCalledTimes(1)
  })

  test('CheckoutPage shows cart summary and submits order payload', async () => {
    const handleBackToCart = vi.fn()
    const handlePlaceOrder = vi.fn()

    createOrder.mockResolvedValue({ id: 'ORD-123', total: 30465000, payment: 'COD' })

    const cartItems = [
      {
        product: { id: 1, name: 'Laptop Dell', price: 15000000, image: 'https://example.com/dell.jpg' },
        quantity: 2,
      },
      {
        product: { id: 2, name: 'Mouse Logitech', price: 500000, image: 'https://example.com/mouse.jpg' },
        quantity: 1,
      },
    ]

    renderWithProviders(
      <CheckoutPage
        cartItems={cartItems}
        customerDefaults={{ email: 'buyer@example.com' }}
        isAuthenticated={false}
        appliedCoupon={{ code: 'WELCOME50', discountType: 'FIXED_AMOUNT', discountValue: 50000 }}
        onBackToCart={handleBackToCart}
        onPlaceOrder={handlePlaceOrder}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Tóm tắt đơn hàng' })).toBeTruthy()
    expect(screen.getByText('Laptop Dell')).toBeTruthy()
    expect(screen.getByText('Mouse Logitech')).toBeTruthy()
    expect(screen.getByText('30.500.000 đ')).toBeTruthy()
    expect(screen.getByText('30.465.000 đ')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Nguyễn Văn A' } })
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0901234567' } })
    fireEvent.change(screen.getByLabelText('Địa chỉ giao hàng'), { target: { value: '12 Nguyễn Huệ' } })
    fireEvent.change(screen.getByLabelText('Tỉnh / Thành phố'), { target: { value: 'hcm' } })
    fireEvent.change(screen.getByLabelText('Quận / Huyện'), { target: { value: 'q1' } })

    fireEvent.click(screen.getByRole('button', { name: /Xác nhận đặt hàng/i }))

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledTimes(1)
    })

    expect(handlePlaceOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ORD-123',
        total: 30465000,
        payment: 'COD',
        guest: true,
        couponCode: 'WELCOME50',
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      }),
    )

    const payload = createOrder.mock.calls[0][0]
    expect(payload.total).toBe(30465000)
    expect(payload.couponCode).toBe('WELCOME50')
    expect(payload.customer.fullName).toBe('Nguyễn Văn A')
    expect(payload.customer.cityLabel).toBe('Hồ Chí Minh')
    expect(payload.customer.districtLabel).toBe('Quận 1')
  })
})