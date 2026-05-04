export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        aria-label="Trang trước"
        className="flex h-10 w-10 items-center justify-center rounded border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          aria-current={page === currentPage ? 'page' : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded text-sm font-medium transition ${
            page === currentPage
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}

      <button
        aria-label="Trang sau"
        className="flex h-10 w-10 items-center justify-center rounded border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  )
}
