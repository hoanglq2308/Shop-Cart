export default function SuccessPage({ order }) {
  const orderId = order?.id ?? '#LUXE-000000'
  const total = order?.total ?? 0
  const payment = order?.payment ?? 'COD'

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-zinc-900 flex flex-col">
      <header className="w-full py-8 flex justify-center items-center bg-white border-b border-zinc-200">
        <div className="font-h2 text-h2 text-zinc-900 uppercase tracking-widest font-black">LUXE</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-[600px] mx-auto">
        <div className="mb-6 flex justify-center">
          <span className="material-symbols-outlined text-[80px] text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-bold mb-2">Cảm ơn bạn đã đặt hàng</h1>
          <p className="text-zinc-600">Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.</p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-zinc-50 p-3 rounded">
            <span className="text-sm text-zinc-500">Mã đơn hàng</span>
            <span className="text-lg font-bold">{orderId}</span>
          </div>

          <div className="h-px w-full bg-zinc-100 my-4" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Phương thức thanh toán</span>
              <span className="font-medium">{payment === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : payment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Tổng tiền</span>
              <span className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('vi-VN').format(total)} đ</span>
            </div>
          </div>
        </div>

        <a className="w-full sm:w-auto min-w-[300px] bg-emerald-700 text-white rounded-lg py-4 px-8 flex items-center justify-center font-medium hover:opacity-90 transition-opacity" href="#" onClick={() => window.location.reload()}>
          Quay lại trang chủ
        </a>
      </main>
    </div>
  )
}
