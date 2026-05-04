import { useMemo, useState } from 'react'
import { useToast } from './components/ToastProvider'
import Footer from './components/Footer'
import TopBar from './components/TopBar'
import { products } from './data/products'
import CartPage from './page/CartPage'
import CheckoutPage from './page/CheckoutPage'
import SuccessPage from './page/SuccessPage'
import ShopPage from './page/ShopPage'

function App() {
  const [activePage, setActivePage] = useState('shop')
  const [cartItems, setCartItems] = useState([
    { product: products[0], quantity: 1 },
    { product: products[1], quantity: 1 },
  ])

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const { addToast } = useToast()

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      return
    }

    setCartItems((prev) => {
      const existed = prev.find((item) => item.product.id === product.id)

      if (!existed) {
        return [...prev, { product, quantity: 1 }]
      }

      return prev.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item,
      )
    })
    // show toast success
    try {
      addToast({ type: 'success', title: 'Đã thêm vào giỏ', description: product.name })
    } catch (e) {
      /* noop */
    }
  }

  const handleIncreaseItem = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, item.product.stock),
            }
          : item,
      ),
    )
  }

  const handleDecreaseItem = (productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.max(item.quantity - 1, 0),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return
    }

    setActivePage('checkout')
  }

  const [lastOrder, setLastOrder] = useState(null)

  const handlePlaceOrder = (order) => {
    // store order details and clear cart
    setLastOrder(order)
    setCartItems([])
    setActivePage('success')
  }

  if (activePage === 'checkout') {
    return (
      <CheckoutPage cartItems={cartItems} onBackToCart={() => setActivePage('cart')} onPlaceOrder={handlePlaceOrder} />
    )
  }

  if (activePage === 'success') {
    return <SuccessPage order={lastOrder} />
  }

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-zinc-900">
      <TopBar
        activePage={activePage}
        cartCount={cartCount}
        onNavigateCart={() => setActivePage('cart')}
        onNavigateShop={() => setActivePage('shop')}
      />

      {activePage === 'shop' ? (
        <ShopPage onAddToCart={handleAddToCart} />
      ) : (
        <CartPage
          cartItems={cartItems}
          onCheckout={handleCheckout}
          onDecreaseItem={handleDecreaseItem}
          onIncreaseItem={handleIncreaseItem}
          onRemoveItem={handleRemoveItem}
        />
      )}

      <Footer />
    </div>
  )
}

export default App
