import { useMemo } from 'react'
import CartItemRow from '../components/CartItemRow'
import OrderSummary from '../components/OrderSummary'

export default function CartPage({
  cartItems,
  onDecreaseItem,
  onIncreaseItem,
  onRemoveItem,
  onCheckout,
}) {
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems],
  )

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 md:text-5xl">Giỏ hàng</h1>
        <p className="mt-2 text-zinc-600">Kiểm tra lại các sản phẩm của bạn trước khi thanh toán.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded border border-dashed border-zinc-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-zinc-900">Giỏ hàng của bạn đang trống</p>
          <p className="mt-1 text-zinc-500">Hãy quay lại cửa hàng và thêm sản phẩm bạn thích.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {cartItems.map((item) => (
              <CartItemRow
                item={item}
                key={item.product.id}
                onDecrease={onDecreaseItem}
                onIncrease={onIncreaseItem}
                onRemove={onRemoveItem}
              />
            ))}
          </div>

          <div className="lg:col-span-4">
            <OrderSummary onCheckout={onCheckout} subtotal={subtotal} />
          </div>
        </div>
      )}
    </main>
  )
}
