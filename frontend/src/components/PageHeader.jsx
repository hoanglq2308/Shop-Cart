export default function PageHeader({ sortBy, onSortChange }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-zinc-300/70 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 md:text-5xl">Bộ sưu tập tuyển chọn</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          Khám phá những sản phẩm mới nhất của chúng tôi, được thiết kế với chất lượng vượt trội và phong cách tối giản.
        </p>
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
        Sắp xếp theo:
        <select
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none transition focus:border-zinc-900"
          onChange={(event) => onSortChange(event.target.value)}
          value={sortBy}
        >
          <option value="newest">Mới nhất</option>
          <option value="price-desc">Giá: Cao đến thấp</option>
          <option value="price-asc">Giá: Thấp đến cao</option>
        </select>
      </label>
    </div>
  )
}
