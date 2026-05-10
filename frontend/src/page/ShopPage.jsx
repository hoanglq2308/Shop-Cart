import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import { getAllProducts } from '../services/productService'

const ITEMS_PER_PAGE = 8

function sortProducts(items, sortBy) {
  const cloned = [...items]

  if (sortBy === 'price-asc') {
    return cloned.sort((a, b) => a.price - b.price)
  }

  if (sortBy === 'price-desc') {
    return cloned.sort((a, b) => b.price - a.price)
  }

  return cloned.sort((a, b) => b.id - a.id)
}

export default function ShopPage({ onAddToCart }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await getAllProducts()
        // Transform API response to match frontend format
        const transformedProducts = data.map((product) => ({
          id: product.id,
          name: product.name,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          stock: product.stockQuantity,
          imageUrl: product.imageUrl,
          createdAt: new Date().toISOString().split('T')[0], // Use today's date as fallback
        }))
        setProducts(transformedProducts)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError('Không thể tải sản phẩm')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [sortBy, products])
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, sortedProducts])

  const handleSortChange = (nextSortBy) => {
    setSortBy(nextSortBy)
    setCurrentPage(1)
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader onSortChange={handleSortChange} sortBy={sortBy} />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Đang tải sản phẩm...</div>
        </div>
      )}

      {error && (
        <div className="rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentItems.map((product) => (
              <ProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </main>
  )
}
