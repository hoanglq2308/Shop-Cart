import { useEffect, useMemo, useState } from 'react'

const emptyLoginForm = { email: '', password: '' }
const emptyRegisterForm = { name: '', email: '', password: '', confirmPassword: '' }

function formatOrderDate(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AuthModal({ isOpen, currentUser, onClose, onLogin, onLogout, onRegister }) {
  const isAuthenticated = Boolean(currentUser)
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const orders = useMemo(() => currentUser?.orders ?? [], [currentUser])

  useEffect(() => {
    if (isOpen) {
      setMode(isAuthenticated ? 'account' : 'login')
    }
  }, [isAuthenticated, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setLoginForm(emptyLoginForm)
      setRegisterForm(emptyRegisterForm)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    const isSuccess = await onLogin(loginForm)
    if (isSuccess) {
      setLoginForm(emptyLoginForm)
      onClose()
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      return
    }

    const isSuccess = await onRegister(registerForm)
    if (isSuccess) {
      setRegisterForm(emptyRegisterForm)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <section className="relative max-h-[90vh] overflow-auto p-6 md:p-8 pt-12">
          <button
            aria-label="Đóng"
            className="absolute right-4 top-2 z-10 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {isAuthenticated ? (
            <div className="pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Tài khoản của bạn</p>
              <h3 className="mt-2 text-3xl font-bold text-zinc-900">Xin chào, {currentUser.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">{currentUser.email}</p>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Địa chỉ đã lưu</p>
                <div className="mt-3 space-y-1 text-sm text-zinc-700">
                  <p className="font-semibold text-zinc-900">{currentUser.savedAddress?.fullName || currentUser.name}</p>
                  <p>{currentUser.savedAddress?.phone || 'Chưa có số điện thoại'}</p>
                  <p>{currentUser.savedAddress?.address || 'Chưa có địa chỉ'}</p>
                  <p>
                    {currentUser.savedAddress?.districtLabel || 'Chưa chọn quận/huyện'}
                    {currentUser.savedAddress?.cityLabel ? `, ${currentUser.savedAddress.cityLabel}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 p-4">
                <h4 className="text-lg font-semibold text-zinc-900">Lịch sử đơn hàng</h4>
                <p className="text-sm text-zinc-500">Chỉ đơn đặt khi đã đăng nhập mới được lưu tại đây.</p>

                {orders.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
                    Chưa có đơn hàng nào được lưu.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-semibold text-zinc-900">{order.id}</span>
                          <span className="text-sm text-zinc-500">{formatOrderDate(order.createdAt)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
                          <span>{order.items?.length || 0} sản phẩm</span>
                          <span className="font-semibold text-zinc-900">
                            {new Intl.NumberFormat('vi-VN').format(order.total)} đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  className="rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition hover:bg-zinc-100"
                  onClick={onClose}
                  type="button"
                >
                  Đóng
                </button>
                <button
                  className="rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition hover:opacity-90"
                  onClick={onLogout}
                  type="button"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10 mt-8 flex rounded-full bg-zinc-100 p-1">
                <button
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                  }`}
                  onClick={() => setMode('login')}
                  type="button"
                >
                  Đăng nhập
                </button>
                <button
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                  }`}
                  onClick={() => setMode('register')}
                  type="button"
                >
                  Đăng ký
                </button>
              </div>

              {mode === 'login' ? (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900">Đăng nhập</h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      Nếu đã có tài khoản, bạn có thể xem lịch sử đơn hàng và địa chỉ đã lưu.
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Email
                    </span>
                    <input
                      className="h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm outline-none transition focus:border-zinc-900"
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@example.com"
                      required
                      value={loginForm.email}
                      type="email"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Mật khẩu
                    </span>
                    <input
                      className="h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm outline-none transition focus:border-zinc-900"
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder="Nhập mật khẩu"
                      required
                      value={loginForm.password}
                      type="password"
                    />
                  </label>

                  <button
                    className="h-12 w-full rounded-lg bg-emerald-700 font-semibold text-white transition hover:bg-emerald-800"
                    type="submit"
                  >
                    Đăng nhập
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900">Đăng ký</h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      Tạo tài khoản để tự động lưu địa chỉ và đơn hàng sau này.
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Họ và tên
                    </span>
                    <input
                      className="h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm outline-none transition focus:border-zinc-900"
                      onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Nguyễn Văn A"
                      required
                      value={registerForm.name}
                      type="text"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Email
                    </span>
                    <input
                      className="h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm outline-none transition focus:border-zinc-900"
                      onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@example.com"
                      required
                      value={registerForm.email}
                      type="email"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Mật khẩu
                      </span>
                      <input
                        className="h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm outline-none transition focus:border-zinc-900"
                        onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Tạo mật khẩu"
                        required
                        value={registerForm.password}
                        type="password"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Xác nhận mật khẩu
                      </span>
                      <input
                        className="h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm outline-none transition focus:border-zinc-900"
                        onChange={(event) =>
                          setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                        }
                        placeholder="Nhập lại mật khẩu"
                        required
                        value={registerForm.confirmPassword}
                        type="password"
                      />
                    </label>
                  </div>

                  <button
                    className="h-12 w-full rounded-lg bg-zinc-900 font-semibold text-white transition hover:opacity-90"
                    type="submit"
                  >
                    Tạo tài khoản
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}