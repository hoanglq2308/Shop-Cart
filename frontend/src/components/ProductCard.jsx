const currencyFormatter = new Intl.NumberFormat('vi-VN')

function getStockLabel(stock) {
  if (stock === 0) {
    return {
      text: 'Hết hàng',
      className: 'bg-red-100 text-red-700',
    }
  }

  if (stock <= 2) {
    return {
      text: `Chỉ còn ${stock} sản phẩm!`,
      className: 'bg-blue-100 text-blue-700',
    }
  }

  return {
    text: `Còn hàng: ${stock}`,
    className: 'bg-emerald-100 text-emerald-700',
  }
}

export default function ProductCard({ product, onAddToCart }) {
  const stockLabel = getStockLabel(product.stock)
  const isOutOfStock = product.stock === 0

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded border border-zinc-200 bg-white shadow-sm transition ${
        isOutOfStock ? 'opacity-80' : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div className="relative h-56 overflow-hidden bg-zinc-100 p-3">
        <img
          alt={product.name}
          className={`h-full w-full object-contain transition duration-500 ${
            isOutOfStock ? 'grayscale-[30%]' : 'group-hover:scale-103'
          }`}
          src={product.imageUrl}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
            <span className="rotate-[-4deg] rounded bg-red-100 px-4 py-2 text-lg font-semibold text-red-700 shadow">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <span
          className={`inline-block w-fit rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${stockLabel.className}`}
        >
          {stockLabel.text}
        </span>
        <h3 className="clamp-2 mt-1 text-base font-semibold text-zinc-900">{product.name}</h3>

        <p className={`mt-auto pt-2 text-lg font-bold ${isOutOfStock ? 'text-zinc-500' : 'text-zinc-900'}`}>
          {currencyFormatter.format(product.price)} đ
        </p>
        <button
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded px-3 py-2 font-medium text-sm transition ${
            isOutOfStock
              ? 'cursor-not-allowed border border-zinc-300 bg-zinc-100 text-zinc-500'
              : 'bg-emerald-700 text-white hover:bg-emerald-800'
          }`}
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isOutOfStock ? 'remove_shopping_cart' : 'add_shopping_cart'}
          </span>
          {isOutOfStock ? 'Không khả dụng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </article>
  )
}
