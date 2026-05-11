import { useState } from 'react'
import { validateCoupon } from '../services/couponService'
import { calculateOrderPrice } from '../utils/priceCalculation'

const currencyFormatter = new Intl.NumberFormat('vi-VN')
const SHIPPING_FEE = 15000

export default function OrderSummary({ subtotal, onCheckout, appliedCoupon, onCouponApplied }) {
  const [coupon, setCoupon] = useState('')
  const [localCoupon, setLocalCoupon] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0
  const effectiveCoupon = appliedCoupon || localCoupon
  const couponModel = effectiveCoupon ? { type: effectiveCoupon.discountType, value: effectiveCoupon.discountValue } : null
  const pricing = calculateOrderPrice([{ price: subtotal, quantity: 1 }], couponModel, shippingFee)

  const applyCoupon = async () => {
    const code = coupon.trim()

    if (!code) {
      setMessage('Vui lòng nhập mã giảm giá')
      setMessageType('error')
      return
    }

    setIsApplying(true)
    try {
      const response = await validateCoupon(code, subtotal, shippingFee)
      if (response.success) {
        setLocalCoupon(response.coupon)
        setMessage(response.message || 'Áp mã giảm giá thành công')
        setMessageType('success')
        onCouponApplied?.(response.coupon)
      } else {
        setLocalCoupon(null)
        setMessage(response.message || 'Mã giảm giá không hợp lệ')
        setMessageType('error')
        onCouponApplied?.(null)
      }
    } catch {
      setLocalCoupon(null)
      setMessage('Không thể áp mã giảm giá lúc này')
      setMessageType('error')
      onCouponApplied?.(null)
    } finally {
      setIsApplying(false)
    }
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
          <span>Giảm giá{effectiveCoupon?.code ? ` (${effectiveCoupon.code})` : ''}</span>
          <span>-{currencyFormatter.format(pricing.discount)} đ</span>
        </div>
      </div>

      <div className="mb-6 border-t border-zinc-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">Tổng cộng</span>
          <span className="text-xl font-bold text-zinc-900">{currencyFormatter.format(pricing.total)} đ</span>
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
            className="rounded border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={applyCoupon}
            type="button"
            disabled={isApplying}
          >
            {isApplying ? 'Đang áp...' : 'Áp dụng'}
          </button>
        </div>
        {message && (
          <p className={`mt-2 text-xs ${messageType === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}
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
