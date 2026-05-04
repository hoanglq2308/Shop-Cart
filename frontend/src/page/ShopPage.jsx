import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const ITEMS_PER_PAGE = 8

function sortProducts(items, sortBy) {
  const cloned = [...items]

  if (sortBy === 'price-asc') {
    return cloned.sort((a, b) => a.price - b.price)
  }

  if (sortBy === 'price-desc') {
    return cloned.sort((a, b) => b.price - a.price)
  }

  return cloned.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export default function ShopPage({ onAddToCart }) {
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [sortBy])
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
    </main>
  )
}
