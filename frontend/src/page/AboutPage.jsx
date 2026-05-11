export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8 md:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-zinc-50 shadow-sm">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center md:px-10 md:py-14">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Về LUXE
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-zinc-900 md:text-6xl">
              Một cửa hàng được xây để mua nhanh, rõ ràng và tin cậy.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
              LUXE tập trung vào trải nghiệm mua sắm gọn gàng: sản phẩm dễ tìm, giỏ hàng dễ kiểm tra, thanh toán đơn giản và trạng thái đơn hàng minh bạch.
            </p>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
            <div className="rounded-2xl bg-zinc-950 px-5 py-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Tầm nhìn</p>
              <p className="mt-3 text-lg font-semibold leading-7">
                Tạo ra một trải nghiệm thương mại điện tử sạch, nhanh và dễ dùng cho mọi thiết bị.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-2xl font-black text-emerald-700">24/7</p>
                <p className="mt-1 text-sm text-zinc-600">Mua sắm mọi lúc</p>
              </div>
              <div className="rounded-2xl bg-zinc-100 p-4">
                <p className="text-2xl font-black text-zinc-900">100%</p>
                <p className="mt-1 text-sm text-zinc-600">Thông tin rõ ràng</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-2xl font-black text-amber-700">1</p>
                <p className="mt-1 text-sm text-zinc-600">Luồng mua gọn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900">Sản phẩm chọn lọc</h2>
          <p className="mt-3 leading-7 text-zinc-600">
            Danh mục được tổ chức để bạn lướt nhanh, so sánh giá và kiểm tra tồn kho ngay trên màn hình.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900">Giỏ hàng trực quan</h2>
          <p className="mt-3 leading-7 text-zinc-600">
            Theo dõi số lượng, cập nhật hàng hóa và chuyển sang thanh toán mà không bị rối luồng.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900">Thanh toán rõ ràng</h2>
          <p className="mt-3 leading-7 text-zinc-600">
            Tóm tắt đơn hàng, phí vận chuyển và giảm giá được hiển thị rõ trước khi đặt hàng.
          </p>
        </article>
      </section>
    </main>
  )
}