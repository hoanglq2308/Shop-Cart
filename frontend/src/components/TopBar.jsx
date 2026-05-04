const navItems = [
  { key: 'shop', label: 'Cửa hàng' },
  { key: 'new', label: 'Hàng mới về' },
  { key: 'about', label: 'Giới thiệu' },
]

export default function TopBar({ activePage, cartCount, onNavigateShop, onNavigateCart }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#121826] shadow-sm">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-8">
        <button
          className="text-2xl font-black tracking-[0.18em] text-white"
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
                  ? 'border-b-2 border-emerald-500 pb-1 font-semibold text-white'
                  : 'border-b-2 border-transparent pb-1 font-medium text-slate-300 transition-colors hover:text-white'
              }
              key={item.label}
              onClick={item.key === 'shop' ? onNavigateShop : undefined}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-emerald-500 md:gap-4">
          <button
            aria-label="Tìm kiếm"
            className="rounded-full p-2 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          <button
            aria-label="Giỏ hàng"
            className="relative rounded-full p-2 transition-colors hover:bg-white/5 hover:text-white"
            onClick={onNavigateCart}
            type="button"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#121826] bg-emerald-500 px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
