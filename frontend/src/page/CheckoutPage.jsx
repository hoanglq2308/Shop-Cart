import { useMemo, useState } from 'react'
import { useLoading } from '../components/LoadingProvider'
import { useToast } from '../components/ToastProvider'
import { createOrder } from '../services/orderService'
import { calculateOrderPrice } from '../utils/priceCalculation'

const currencyFormatter = new Intl.NumberFormat('vi-VN')
const SHIPPING_FEE = 15000

const cities = [
  { value: 'hcm', label: 'Hồ Chí Minh' },
  { value: 'hn', label: 'Hà Nội' },
  { value: 'dn', label: 'Đà Nẵng' },
]

const districts = [
  { value: 'q1', label: 'Quận 1' },
  { value: 'q3', label: 'Quận 3' },
  { value: 'tb', label: 'Quận Tân Bình' },
]

export default function CheckoutPage({ cartItems, customerDefaults, isAuthenticated, appliedCoupon, onBackToCart, onPlaceOrder }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showLoading, hideLoading } = useLoading()
  const { addToast } = useToast()

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems],
  )

  const couponModel = appliedCoupon ? { type: appliedCoupon.discountType, value: appliedCoupon.discountValue } : null
  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0
  const pricing = calculateOrderPrice([{ price: subtotal, quantity: 1 }], couponModel, shippingFee)
  const total = pricing.total
  const discount = pricing.discount

  const handleSubmit = (event) => {
    event.preventDefault()

    if (cartItems.length === 0) {
      return
    }

    const formEl = event.currentTarget

    if (!formEl.reportValidity()) {
      return
    }
    showLoading()
    setIsSubmitting(true)

    const formData = new FormData(formEl)

    // collect minimal customer info from form
    const customer = {
      fullName: formData.get('fullName')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      address: formData.get('address')?.toString() || '',
      city: formData.get('city')?.toString() || '',
      district: formData.get('district')?.toString() || '',
      cityLabel: cities.find((city) => city.value === formData.get('city'))?.label || '',
      districtLabel: districts.find((district) => district.value === formData.get('district'))?.label || '',
    }

    const items = cartItems.map((it) => ({ productId: it.product.id, quantity: it.quantity }))

    const payload = { customer, items, couponCode: appliedCoupon?.code || null, total }

    // Try calling backend; if it fails, fallback to local simulated order
    createOrder(payload)
      .then((data) => {
        if (data && data.success === false) {
          hideLoading()
          setIsSubmitting(false)
          addToast({ type: 'error', title: 'Không thể đặt hàng', description: data.message || 'Dữ liệu đặt hàng không hợp lệ' })
          return
        }

        // assume backend returns { id, total, payment }
        hideLoading()
        setIsSubmitting(false)
        addToast({ type: 'success', title: 'Đặt hàng thành công', description: 'Đơn hàng đã được gửi tới hệ thống.' })
        onPlaceOrder({
          id: data.id ?? data.orderId ?? `#LUXE-${Math.floor(Math.random() * 900000 + 100000)}`,
          total: data.total ?? total,
          payment: data.payment ?? 'COD',
          items,
          customer,
          couponCode: appliedCoupon?.code || null,
          discountAmount: data.discountAmount ?? discount,
          guest: !isAuthenticated,
          createdAt: new Date().toISOString(),
        })
      })
      .catch(() => {
        hideLoading()
        setIsSubmitting(false)
        addToast({ type: 'error', title: 'Lỗi kết nối', description: 'Không thể kết nối tới máy chủ. Đơn hàng được tạo tạm thời.' })
        const id = `#LUXE-${Math.floor(Math.random() * 900000 + 100000)}`
        onPlaceOrder({
          id,
          total,
          payment: 'COD',
          items,
          customer,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discount,
          guest: !isAuthenticated,
          createdAt: new Date().toISOString(),
        })
      })
  }

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white py-4">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center px-4 md:px-8">
          <button className="text-3xl font-black tracking-tight text-zinc-900" onClick={onBackToCart} type="button">
            LUXE
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-5xl">Thanh toán</h1>
          <p className="mt-2 text-zinc-600">
            Hoàn tất đơn hàng của bạn để trải nghiệm phong cách sống sang trọng.
          </p>
          <p className={`mt-2 text-sm ${isAuthenticated ? 'text-emerald-700' : 'text-zinc-500'}`}>
            {isAuthenticated
              ? 'Bạn đang đăng nhập, địa chỉ có thể được lưu tự động để lần sau điền nhanh hơn.'
              : 'Bạn đang mua với tư cách khách. Đơn hàng vẫn được tạo, nhưng sẽ không lưu vào lịch sử.'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-zinc-900">Không có sản phẩm để thanh toán</p>
            <p className="mt-1 text-zinc-500">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
            <button
              className="mt-4 rounded bg-zinc-900 px-4 py-2 font-medium text-white"
              onClick={onBackToCart}
              type="button"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-2/3">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                <h2 className="mb-4 text-2xl font-semibold">Thông tin giao hàng</h2>

                <form className="space-y-4" id="checkout-form" onSubmit={handleSubmit} key={customerDefaults?.email || 'guest'}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500" htmlFor="fullName">
                        Họ và tên
                      </label>
                      <input
                        className="h-12 rounded border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                        id="fullName"
                        name="fullName"
                        placeholder="Nguyễn Văn A"
                        required
                        defaultValue={customerDefaults?.fullName || ''}
                        type="text"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500" htmlFor="phone">
                        Số điện thoại
                      </label>
                      <input
                        className="h-12 rounded border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                        id="phone"
                        name="phone"
                        placeholder="090 123 4567"
                        required
                        defaultValue={customerDefaults?.phone || ''}
                        type="tel"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500" htmlFor="address">
                      Địa chỉ giao hàng
                    </label>
                    <input
                      className="h-12 rounded border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                      id="address"
                      name="address"
                      placeholder="Số nhà, Tên đường, Phường/Xã..."
                      required
                      defaultValue={customerDefaults?.address || ''}
                      type="text"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500" htmlFor="city">
                        Tỉnh / Thành phố
                      </label>
                      <select
                        className="h-12 rounded border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                        id="city"
                        name="city"
                        required
                        defaultValue={customerDefaults?.city || ''}
                      >
                        <option disabled value="">
                          Chọn Tỉnh / Thành phố
                        </option>
                        {cities.map((city) => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500" htmlFor="district">
                        Quận / Huyện
                      </label>
                      <select
                        className="h-12 rounded border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                        id="district"
                        name="district"
                        required
                        defaultValue={customerDefaults?.district || ''}
                      >
                        <option disabled value="">
                          Chọn Quận / Huyện
                        </option>
                        {districts.map((district) => (
                          <option key={district.value} value={district.value}>
                            {district.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="sticky top-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                <h2 className="mb-4 text-xl font-semibold">Tóm tắt đơn hàng</h2>

                <div className="mb-4 flex flex-col gap-2 border-b border-zinc-200 pb-4">
                  {cartItems.map((item) => (
                    <div className="flex items-center gap-2" key={item.product.id}>
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-zinc-200 p-1">
                        <img alt={item.product.name} className="h-full w-full object-contain" src={item.product.imageUrl} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="clamp-1 text-sm font-semibold text-zinc-900">{item.product.name}</h3>
                        <p className="text-sm text-zinc-500">x{item.quantity}</p>
                      </div>
                      <div className="whitespace-nowrap text-sm font-semibold">
                        {currencyFormatter.format(item.product.price * item.quantity)} đ
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 flex flex-col gap-1 text-sm text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span>{currencyFormatter.format(subtotal)} đ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{currencyFormatter.format(shippingFee)} đ</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Giảm giá{appliedCoupon?.code ? ` (${appliedCoupon.code})` : ''}</span>
                    <span>- {currencyFormatter.format(discount)} đ</span>
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-between border-t border-zinc-200 pt-4">
                  <span className="text-lg font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold">{currencyFormatter.format(total)} đ</span>
                </div>

                <button
                  className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-zinc-900 text-base font-semibold text-white transition-opacity hover:opacity-90"
                  form="checkout-form"
                  type="submit"
                >
                  <span className={isSubmitting ? 'invisible' : 'flex items-center gap-2'}>
                    Xác nhận đặt hàng
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </span>

                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95">
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      <span className="ml-2 text-sm font-medium">Đang xử lý...</span>
                    </div>
                  )}
                </button>

                <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Thanh toán an toàn
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
