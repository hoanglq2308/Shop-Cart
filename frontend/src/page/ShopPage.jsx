import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import { getAllProducts } from '../services/productService'

const ITEMS_PER_PAGE = 8

// Map to provide placeholder images for products
const productImages = {
  1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATnmS6hkLIPi-3WvY0Bbo8Qtgc0pLfjUZTQvfKP96d8PSeLzgLT0O1VTH9lOzyFkt1FcSUCpJHPbRvaQOGao7JNE9p8RO6xMgZYfHVrzARiowp88H-hKl8AQHMMHcs7zven4CauAJoXHT7ak_6E2oI8nOGt1pfwiMQwef4QdBHwoMjyXZbeiWOhFcOQt97iSgYcNrH9hbvmvVcrVrOt28dtjOpl1vooJtvb4Wqio9Yv2qlB-cu-q6LROqGzUlPv6xE_gpkS3QyvIqQ',
  2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX5YLo8L5-snqNafePz-DtA5la6Uxjb9Z2jP2gWNzj9JuBz__5pZEKDK5whhWbe8PwY4Jh7g2P-ZC5Rm8r5dSlQW8giWqorKJ9O44CoFpPLPltxPiG8Fg1I_Jgs9QwNXzkqpiZ5yavlH9sCb-R2M6iWhEYKZ6R8lsg9mLfeN-T-34oNNJ1axu5H_KBWrdzxqy6Zp1J4QnRKgMF0Auq8iZeRr3l4dB1DLueZ39MSuf5GUilyWBISzEPmlflvum9y5RzyEB2t6UNbtCh',
  3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJCnRtTg7hfaJH02MLe2UJC7e1rCKtqg6ddjMTi9SZCddUkW7LgAO5jSO90Mg_yBvbYsuV-zuCLRRYbCV0wJ7_9ck-0YU9QXeVm_dHVNWwRC6_ORuc1k0OsAUjuVkKAzsrHiSohrS191ZyF4temNZ5Ei9IPx-6VQryo5oenteAl3MM-NacLg5bRFJ98DfyM1FzfSnGujnvEmHFlSTh1lpCsiVlpgRG_CSMMQs2oCcA_6_p_1DuZ7vU46BQvQpI6ax41Fat35lV0Y9',
  4: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDzVau1yOPC_RuoOQfrfCPBbpS8E5htLryP8ytQ8oXWeyEpXouqx1GQvxw9cmCx6Qe1ynAAUwdlIVESyNYRUlJl5-6jsLOEHQVpse59V5AjzJX6btPZHO-0SEm3AHd-16lCDwjAKSPjN7kBMoqHjr0b1yKvCSGLQsXEi4XT5YBFIXzHPcaR0VtjvqvxXwefE8jR64HytV7vfjOaFoicNVXSrzbCA_lkvz__HKDyIepLIasJx6FY4kWCrm9Iz18F6_ZIWMr-4DklWuO',
  5: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUOpzuphR-BoPcyi14DUHDvQGMHgOUKku-OpXFHOKE0KRMlXJK3DoMqg3S5k3MMK5ZzfMtTo0GqrXZzA0pTdVRskilq_3DiYenZQWTpjE_ACgLAcwQXfeY1G07WMw_bLdL_I4gcMJL4qiOn0PUVAONyhFws3PWdahNCCjKLdeb6VZaY71h5ckfHjue-MavJWtl6H_XWvoGDxDNAK9TJ---1cSPb5XvZIepmb-8ngVk-u0dNv0F8IVs-_D-5B9eurX96tN-5Tr2UP2o',
  6: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJCnRtTg7hfaJH02MLe2UJC7e1rCKtqg6ddjMTi9SZCddUkW7LgAO5jSO90Mg_yBvbYsuV-zuCLRRYbCV0wJ7_9ck-0YU9QXeVm_dHVNWwRC6_ORuc1k0OsAUjuVkKAzsrHiSohrS191ZyF4temNZ5Ei9IPx-6VQryo5oenteAl3MM-NacLg5bRFJ98DfyM1FzfSnGujnvEmHFlSTh1lpCsiVlpgRG_CSMMQs2oCcA_6_p_1DuZ7vU46BQvQpI6ax41Fat35lV0Y9',
}

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
          price: typeof product.price === 'string' ? parseInt(product.price) : product.price,
          stock: product.stockQuantity,
          image: productImages[product.id] || productImages[1], // Fallback to first image
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
