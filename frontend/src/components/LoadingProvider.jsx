import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext(null)

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0)

  const showLoading = () => setLoadingCount((c) => c + 1)
  const hideLoading = () => setLoadingCount((c) => Math.max(0, c - 1))

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {loadingCount > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded bg-white/90 p-6 shadow-lg">
            <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
            <div className="text-lg font-medium">Đang xử lý...</div>
            <div className="text-sm text-zinc-600">Vui lòng chờ, đừng bấm nhiều lần để tránh tạo lặp</div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}
