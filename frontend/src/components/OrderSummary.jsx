import { useState } from 'react'

const currencyFormatter = new Intl.NumberFormat('vi-VN')
const SHIPPING_FEE = 15000
const COUPON_CODE = 'WELCOME50'
const COUPON_DISCOUNT = 50000

export default function OrderSummary({ subtotal, onCheckout }) {
  const [coupon, setCoupon] = useState('')
  const [isCouponApplied, setIsCouponApplied] = useState(false)

  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0
  const discount = isCouponApplied ? COUPON_DISCOUNT : 0
  const total = Math.max(0, subtotal + shippingFee - discount)

  const applyCoupon = () => {
    setIsCouponApplied(coupon.trim().toUpperCase() === COUPON_CODE)
  }

  return (
    <div className="sticky top-[100px] rounded border border-zinc-200 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <h2 className="mb-4 border-b border-zinc-200 pb-4 text-2xl font-semibold text-zinc-900">Tóm tắt đơn hàng</h2>

      <div className="mb-4 space-y-2 text-sm text-zinc-600">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span className="text-zinc-900">{currencyFormatter.format(subtotal)} đ</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span className="text-zinc-900">{currencyFormatter.format(shippingFee)} đ</span>
        </div>
        <div className="flex justify-between font-medium text-emerald-700">
          <span>Giảm giá ({COUPON_CODE})</span>
          <span>-{currencyFormatter.format(discount)} đ</span>
        </div>
      </div>

      <div className="mb-6 border-t border-zinc-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">Tổng cộng</span>
          <span className="text-xl font-bold text-zinc-900">{currencyFormatter.format(total)} đ</span>
        </div>
        <p className="mt-1 text-right text-xs text-zinc-500">Đã bao gồm VAT</p>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500" htmlFor="coupon">
          Bạn có mã giảm giá?
        </label>
        <div className="flex gap-2">
          <input
            className="flex-grow rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            id="coupon"
            onChange={(event) => setCoupon(event.target.value)}
            placeholder="Nhập mã giảm giá"
            type="text"
            value={coupon}
          />
          <button
            className="rounded border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200"
            onClick={applyCoupon}
            type="button"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <button
        className="group flex w-full items-center justify-center gap-2 rounded bg-emerald-700 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-800"
        onClick={onCheckout}
        type="button"
      >
        Tiến hành thanh toán
        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
          arrow_forward
        </span>
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <span className="material-symbols-outlined text-[16px]">lock</span>
        <span>Thanh toán an toàn</span>
      </div>
    </div>
  )
}
