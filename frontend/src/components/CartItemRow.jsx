const currencyFormatter = new Intl.NumberFormat('vi-VN')

export default function CartItemRow({ item, onDecrease, onIncrease, onRemove }) {
  const isLowStock = item.product.stock <= 2

  return (
    <div className="relative flex flex-col gap-4 rounded border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
      {isLowStock && <div className="absolute left-0 top-0 h-full w-1 rounded-l bg-red-500" />}

      <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded bg-zinc-100 sm:w-32">
        <img alt={item.product.name} className="h-full w-full object-cover" src={item.product.image} />
      </div>

      <div className="flex flex-grow flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="clamp-2 text-lg font-semibold text-zinc-900">{item.product.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">Số lượng tối đa: {item.product.stock}</p>
            {isLowStock && (
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Chỉ còn {item.product.stock} sản phẩm trong kho!
              </div>
            )}
          </div>

          <div className="text-xl font-bold text-zinc-900">
            {currencyFormatter.format(item.product.price)} đ
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex h-10 w-32 items-center overflow-hidden rounded border border-zinc-300">
            <button
              aria-label="Giảm số lượng"
              className="flex h-full w-10 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100"
              onClick={() => onDecrease(item.cartItemId, item.product.id)}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <div className="flex h-full flex-grow items-center justify-center border-x border-zinc-300 text-sm font-medium text-zinc-900">
              {item.quantity}
            </div>
            <button
              aria-label="Tăng số lượng"
              className="flex h-full w-10 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={item.quantity >= item.product.stock}
              onClick={() => onIncrease(item.cartItemId, item.product.id)}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          <button
            aria-label="Xóa sản phẩm"
            className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-red-600"
            onClick={() => onRemove(item.cartItemId, item.product.id)}
            type="button"
          >
            <span className="material-symbols-outlined">delete</span>
            <span className="hidden text-sm sm:inline">Xóa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
