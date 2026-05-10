import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import CartPage from '../src/page/CartPage'
import { ToastProvider } from '../src/components/ToastProvider'
import { LoadingProvider } from '../src/components/LoadingProvider'
import * as cartService from '../src/services/cartService'

vi.mock('../src/services/cartService')

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderWithProviders(ui) {
  return render(
    <LoadingProvider>
      <ToastProvider>{ui}</ToastProvider>
    </LoadingProvider>,
  )
}

describe('Cart Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('TC1: Hiển thị giỏ hàng trống khi không có sản phẩm', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      message: 'Lấy giỏ hàng thành công',
      cartItems: [],
      cartTotal: 0,
      itemCount: 0,
    })

    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    renderWithProviders(
      <CartPage
        cartItems={[]}
        isLoading={false}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Giỏ hàng của bạn đang trống')).toBeInTheDocument()
    })
  })

  test('TC2: Hiển thị danh sách sản phẩm trong giỏ hàng', async () => {
    const mockCartItems = [
      {
        cartItemId: 1,
        product: {
          id: 1,
          name: 'Laptop Dell',
          price: 15000000,
          stock: 10,
        },
        quantity: 2,
      },
      {
        cartItemId: 2,
        product: {
          id: 2,
          name: 'Mouse Logitech',
          price: 500000,
          stock: 50,
        },
        quantity: 1,
      },
    ]

    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    renderWithProviders(
      <CartPage
        cartItems={mockCartItems}
        isLoading={false}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    expect(screen.getByText('Laptop Dell')).toBeInTheDocument()
    expect(screen.getByText('Mouse Logitech')).toBeInTheDocument()
  })

  test('TC3: Xử lý tăng số lượng sản phẩm', async () => {
    const mockCartItems = [
      {
        cartItemId: 1,
        product: {
          id: 1,
          name: 'Laptop Dell',
          price: 15000000,
          stock: 10,
        },
        quantity: 2,
      },
    ]

    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    vi.mocked(cartService.updateCartItemQuantity).mockResolvedValue({
      success: true,
      message: 'Cập nhật số lượng thành công',
      cartTotal: 45000000,
    })

    renderWithProviders(
      <CartPage
        cartItems={mockCartItems}
        isLoading={false}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    const increaseButtons = screen.getAllByLabelText('Tăng số lượng')
    fireEvent.click(increaseButtons[0])

    await waitFor(() => {
      expect(handleIncreaseItem).toHaveBeenCalled()
    })
  })

  test('TC4: Xử lý giảm số lượng sản phẩm', async () => {
    const mockCartItems = [
      {
        cartItemId: 1,
        product: {
          id: 1,
          name: 'Laptop Dell',
          price: 15000000,
          stock: 10,
        },
        quantity: 2,
      },
    ]

    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    vi.mocked(cartService.updateCartItemQuantity).mockResolvedValue({
      success: true,
      message: 'Cập nhật số lượng thành công',
      cartTotal: 15000000,
    })

    renderWithProviders(
      <CartPage
        cartItems={mockCartItems}
        isLoading={false}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    const decreaseButtons = screen.getAllByLabelText('Giảm số lượng')
    fireEvent.click(decreaseButtons[0])

    await waitFor(() => {
      expect(handleDecreaseItem).toHaveBeenCalled()
    })
  })

  test('TC5: Xử lý xóa sản phẩm khỏi giỏ', async () => {
    const mockCartItems = [
      {
        cartItemId: 1,
        product: {
          id: 1,
          name: 'Laptop Dell',
          price: 15000000,
          stock: 10,
        },
        quantity: 2,
      },
    ]

    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    vi.mocked(cartService.removeCartItem).mockResolvedValue({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    })

    renderWithProviders(
      <CartPage
        cartItems={mockCartItems}
        isLoading={false}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    const deleteButtons = screen.getAllByLabelText('Xóa sản phẩm')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(handleRemoveItem).toHaveBeenCalled()
    })
  })

  test('TC6: Nút thanh toán được kích hoạt khi giỏ không trống', () => {
    const mockCartItems = [
      {
        cartItemId: 1,
        product: {
          id: 1,
          name: 'Laptop Dell',
          price: 15000000,
          stock: 10,
        },
        quantity: 1,
      },
    ]

    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    renderWithProviders(
      <CartPage
        cartItems={mockCartItems}
        isLoading={false}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    const checkoutButton = screen.getByRole('button', { name: /Tiến hành thanh toán/i })
    expect(checkoutButton).not.toBeDisabled()
  })

  test('TC7: Hiển thị loading state', () => {
    const handleCheckout = vi.fn()
    const handleDecreaseItem = vi.fn()
    const handleIncreaseItem = vi.fn()
    const handleRemoveItem = vi.fn()

    renderWithProviders(
      <CartPage
        cartItems={[]}
        isLoading={true}
        onCheckout={handleCheckout}
        onDecreaseItem={handleDecreaseItem}
        onIncreaseItem={handleIncreaseItem}
        onRemoveItem={handleRemoveItem}
      />,
    )

    expect(screen.getByText('Đang tải giỏ hàng...')).toBeInTheDocument()
  })
})
