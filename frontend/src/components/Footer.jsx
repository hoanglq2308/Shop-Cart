const footerLinks = ['Phát triển bền vững', 'Tìm cửa hàng', 'Bảo mật', 'Điều khoản']

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-8">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-zinc-900">LUXE</span>
          <p className="text-xs text-zinc-500">© 2026 LUXE CORPORATE. ALL RIGHTS RESERVED.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
          {footerLinks.map((link) => (
            <a
              className="text-xs font-medium uppercase tracking-[0.06em] text-zinc-500 underline-offset-4 transition hover:text-emerald-700 hover:underline"
              href="#"
              key={link}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
