import { useMemo, useState, useEffect } from 'react'
import AuthModal from './components/AuthModal'
import { useToast } from './components/ToastProvider'
import Footer from './components/Footer'
import TopBar from './components/TopBar'
import { loadAccounts, loadCurrentUserEmail, saveAccounts, saveCurrentUserEmail } from './utils/authStorage'
import CartPage from './page/CartPage'
import CheckoutPage from './page/CheckoutPage'
import SuccessPage from './page/SuccessPage'
import ShopPage from './page/ShopPage'
import { getCart, addToCart, updateCartItemQuantity, removeCartItem } from './services/cartService'

function App() {
  const [activePage, setActivePage] = useState('shop')
  const [accounts, setAccounts] = useState(() => loadAccounts())
  const [currentUserEmail, setCurrentUserEmail] = useState(() => loadCurrentUserEmail())
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [isLoadingCart, setIsLoadingCart] = useState(false)

  async function loadCartFromBackend() {
    try {
      setIsLoadingCart(true)
      const response = await getCart()
      if (response.success && response.cartItems) {
        // Transform backend cart items to frontend format
        const transformedItems = response.cartItems.map((item) => ({
          cartItemId: item.cartItemId,
          product: {
            id: item.productId,
            name: item.productName,
            price: parseFloat(item.price),
            stock: item.stock,
            imageUrl: item.imageUrl,
          },
          quantity: item.quantity,
        }))
        setCartItems(transformedItems)
      }
      setIsLoadingCart(false)
    } catch {
      console.error('Failed to load cart:')
      setIsLoadingCart(false)
      // Initialize with empty cart on error
      setCartItems([])
    }
  }

  // Fetch cart from backend on mount
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCartFromBackend()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const { addToast } = useToast()
  const currentUser = useMemo(
    () => accounts.find((account) => account.email === currentUserEmail) || null,
    [accounts, currentUserEmail],
  )

  const handleAddToCart = async (product) => {
    if (product.stock === 0) {
      addToast({ type: 'error', title: 'Lỗi', description: 'Sản phẩm đã hết hàng' })
      return
    }

    try {
      const response = await addToCart(`P${product.id}`, 1)
      if (response.success) {
        // Reload cart from backend
        await loadCartFromBackend()
        addToast({ type: 'success', title: 'Đã thêm vào giỏ', description: product.name })
      } else {
        addToast({ type: 'error', title: 'Lỗi', description: response.message })
      }
    } catch {
      addToast({ type: 'error', title: 'Lỗi', description: 'Không thể thêm vào giỏ hàng' })
    }
  }

  const handleIncreaseItem = async (cartItemId) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId)
    if (!item) return

    try {
      const newQuantity = item.quantity + 1
      const response = await updateCartItemQuantity(cartItemId, newQuantity)
      if (response.success) {
        await loadCartFromBackend()
        addToast({ type: 'success', title: 'Cập nhật thành công', description: 'Số lượng đã được tăng' })
      } else {
        addToast({ type: 'error', title: 'Lỗi', description: response.message })
      }
    } catch {
      addToast({ type: 'error', title: 'Lỗi', description: 'Không thể cập nhật số lượng' })
    }
  }

  const handleDecreaseItem = async (cartItemId) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId)
    if (!item) return

    if (item.quantity <= 1) {
      // Remove item if quantity is 1
      await handleRemoveItem(cartItemId)
      return
    }

    try {
      const newQuantity = item.quantity - 1
      const response = await updateCartItemQuantity(cartItemId, newQuantity)
      if (response.success) {
        await loadCartFromBackend()
        addToast({ type: 'success', title: 'Cập nhật thành công', description: 'Số lượng đã được giảm' })
      } else {
        addToast({ type: 'error', title: 'Lỗi', description: response.message })
      }
    } catch {
      addToast({ type: 'error', title: 'Lỗi', description: 'Không thể cập nhật số lượng' })
    }
  }

  const handleRemoveItem = async (cartItemId) => {
    try {
      const response = await removeCartItem(cartItemId)
      if (response.success) {
        await loadCartFromBackend()
        addToast({ type: 'success', title: 'Đã xóa', description: 'Sản phẩm đã được xóa khỏi giỏ hàng' })
      } else {
        addToast({ type: 'error', title: 'Lỗi', description: response.message })
      }
    } catch {
      addToast({ type: 'error', title: 'Lỗi', description: 'Không thể xóa sản phẩm' })
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return
    }

    setActivePage('checkout')
  }

  const [lastOrder, setLastOrder] = useState(null)

  const handlePlaceOrder = (order) => {
    const savedOrder = {
      ...order,
      guest: !currentUser,
    }

    if (currentUser) {
      const nextAccounts = accounts.map((account) =>
        account.email === currentUser.email
          ? {
              ...account,
              name: order.customer?.fullName || account.name,
              savedAddress: order.customer,
              orders: [savedOrder, ...(account.orders || [])],
            }
          : account,
      )

      setAccounts(nextAccounts)
      saveAccounts(nextAccounts)
    }

    setLastOrder(savedOrder)
    setCartItems([])
    setActivePage('success')
  }

  const handleLogin = ({ email, password }) => {
    const nextAccount = accounts.find((account) => account.email === email.trim())

    if (!nextAccount || nextAccount.password !== password) {
      addToast({ type: 'error', title: 'Đăng nhập thất bại', description: 'Email hoặc mật khẩu không đúng.' })
      return false
    }

    setCurrentUserEmail(nextAccount.email)
    saveCurrentUserEmail(nextAccount.email)
    addToast({ type: 'success', title: 'Đăng nhập thành công', description: `Xin chào ${nextAccount.name}.` })
    return true
  }

  const handleRegister = ({ name, email, password }) => {
    const normalizedEmail = email.trim()

    if (accounts.some((account) => account.email === normalizedEmail)) {
      addToast({ type: 'error', title: 'Không thể đăng ký', description: 'Email này đã tồn tại.' })
      return false
    }

    const nextAccount = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      savedAddress: null,
      orders: [],
    }

    const nextAccounts = [...accounts, nextAccount]
    setAccounts(nextAccounts)
    saveAccounts(nextAccounts)
    setCurrentUserEmail(nextAccount.email)
    saveCurrentUserEmail(nextAccount.email)
    addToast({ type: 'success', title: 'Đăng ký thành công', description: 'Tài khoản đã được tạo.' })
    return true
  }

  const handleLogout = () => {
    setCurrentUserEmail(null)
    saveCurrentUserEmail(null)
    setIsAuthModalOpen(false)
    addToast({ type: 'success', title: 'Đã đăng xuất', description: 'Bạn đang mua hàng với tư cách khách.' })
  }

  const checkoutDefaults = currentUser?.savedAddress
    ? {
        ...currentUser.savedAddress,
        email: currentUser.email,
        fullName: currentUser.savedAddress.fullName || currentUser.name,
      }
    : {
        email: 'guest',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        district: '',
      }

  if (activePage === 'checkout') {
    return (
      <CheckoutPage
        cartItems={cartItems}
        customerDefaults={checkoutDefaults}
        isAuthenticated={Boolean(currentUser)}
        onBackToCart={() => setActivePage('cart')}
        onPlaceOrder={handlePlaceOrder}
      />
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
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateCart={() => setActivePage('cart')}
        onNavigateShop={() => setActivePage('shop')}
      />

      <AuthModal
        currentUser={currentUser}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRegister={handleRegister}
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
          isLoading={isLoadingCart}
        />
      )}

      <Footer />
    </div>
  )
}

export default App
