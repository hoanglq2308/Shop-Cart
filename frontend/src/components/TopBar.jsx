const navItems = [
  { key: 'shop', label: 'Cửa hàng' },
  { key: 'new', label: 'Hàng mới về' },
  { key: 'about', label: 'Giới thiệu' },
]

export default function TopBar({ activePage, cartCount, currentUser, onNavigateShop, onNavigateCart, onOpenAuth }) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-8">
        <button
          className="text-2xl font-black tracking-[0.18em] text-zinc-900"
          onClick={onNavigateShop}
          type="button"
        >
          LUXE
        </button>

        <nav className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <button
              className={
                activePage === item.key
                  ? 'border-b-2 border-emerald-600 pb-1 font-semibold text-zinc-900'
                  : 'border-b-2 border-transparent pb-1 font-medium text-zinc-600 transition-colors hover:text-zinc-900'
              }
              key={item.label}
              onClick={item.key === 'shop' ? onNavigateShop : undefined}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-emerald-700 md:gap-4">
          <button
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
            onClick={onOpenAuth}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {currentUser ? 'person' : 'login'}
            </span>
            <span>{currentUser ? currentUser.name.split(' ')[0] : 'Đăng nhập'}</span>
          </button>

          <button
            aria-label="Tìm kiếm"
            className="rounded-full p-2 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          <button
            aria-label="Giỏ hàng"
            className="relative rounded-full p-2 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            onClick={onNavigateCart}
            type="button"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
