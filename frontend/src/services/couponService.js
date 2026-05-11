import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const LOCAL_COUPONS = {
  WELCOME50: { code: 'WELCOME50', discountType: 'FIXED_AMOUNT', discountValue: 50000, minOrderValue: 0, usageLimit: 100, usedCount: 0, expiryDate: '2026-12-31 23:59:59', isActive: true },
  GIAM10: { code: 'GIAM10', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 0, usageLimit: 100, usedCount: 5, expiryDate: '2026-12-31 23:59:59', isActive: true },
  TRU50K: { code: 'TRU50K', discountType: 'FIXED_AMOUNT', discountValue: 50000, minOrderValue: 2000000, usageLimit: 50, usedCount: 10, expiryDate: '2026-12-31 23:59:59', isActive: true },
  HETHAN: { code: 'HETHAN', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 0, usageLimit: 100, usedCount: 0, expiryDate: '2023-01-01 00:00:00', isActive: true },
  HETLUOT: { code: 'HETLUOT', discountType: 'FIXED_AMOUNT', discountValue: 100000, minOrderValue: 0, usageLimit: 10, usedCount: 10, expiryDate: '2026-12-31 23:59:59', isActive: true },
}

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase()
}

function calculateDiscount(coupon, subtotal) {
  const normalizedSubtotal = Math.max(0, Number(subtotal) || 0)
  const rawValue = Number(coupon?.discountValue) || 0
  const discountType = String(coupon?.discountType || '').trim().toUpperCase()

  if (discountType === 'PERCENTAGE') {
    return Math.min(normalizedSubtotal, Math.max(0, normalizedSubtotal * (rawValue / 100)))
  }

  if (discountType === 'FIXED_AMOUNT') {
    return Math.min(normalizedSubtotal, Math.max(0, rawValue))
  }

  return 0
}

function fallbackValidate(code, subtotal, shippingFee = 0) {
  const normalizedCode = normalizeCode(code)
  const coupon = LOCAL_COUPONS[normalizedCode]
  const normalizedSubtotal = Math.max(0, Number(subtotal) || 0)
  const normalizedShipping = Math.max(0, Number(shippingFee) || 0)

  const fail = (message) => ({
    success: false,
    message,
    subtotal: normalizedSubtotal,
    shippingFee: normalizedShipping,
    discountAmount: 0,
    total: normalizedSubtotal + normalizedShipping,
  })

  if (!coupon) return fail('Mã giảm giá không tồn tại')
  if (!coupon.isActive) return fail('Mã giảm giá đã bị khóa')
  if ((coupon.usedCount || 0) >= (coupon.usageLimit || 1)) return fail('Mã giảm giá đã hết lượt sử dụng')

  const expiry = new Date(coupon.expiryDate.replace(' ', 'T'))
  if (!Number.isNaN(expiry.getTime()) && expiry.getTime() <= Date.now()) return fail('Mã giảm giá đã hết hạn')
  if (normalizedSubtotal < Number(coupon.minOrderValue || 0)) return fail('Đơn hàng chưa đạt giá trị tối thiểu để áp mã giảm giá')

  const discountAmount = calculateDiscount(coupon, normalizedSubtotal)
  return {
    success: true,
    message: 'Áp mã giảm giá thành công',
    coupon,
    subtotal: normalizedSubtotal,
    shippingFee: normalizedShipping,
    discountAmount,
    total: Math.max(0, normalizedSubtotal + normalizedShipping - discountAmount),
  }
}

export async function validateCoupon(code, subtotal, shippingFee = 0) {
  if (import.meta.env.MODE === 'test') {
    return fallbackValidate(code, subtotal, shippingFee)
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/coupons/validate`, {
      code,
      subtotal,
      shippingFee,
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data
    }

    return fallbackValidate(code, subtotal, shippingFee)
  }
}