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
import { authService } from './services/authService'

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
  const currentUser = useMemo(() => {
    if (!currentUserEmail) return null;
    const account = accounts.find((acc) => acc.email === currentUserEmail);
    if (account) return account;
    // Fallback: If not in local accounts (e.g. from backend API), create a local account entry.
    return { name: localStorage.getItem('currentUserName') || '', email: currentUserEmail, savedAddress: null, orders: [] };
  }, [accounts, currentUserEmail])

  const handleAddToCart = async (product, quantity = 1) => {
    if (!currentUserEmail) {
      addToast({ type: 'warning', title: 'Yêu cầu đăng nhập', description: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' })
      setIsAuthModalOpen(true)
      return
    }

    if (product.stock === 0) {
      addToast({ type: 'error', title: 'Lỗi', description: 'Sản phẩm đã hết hàng' })
      return
    }

    try {
      const response = await addToCart(`P${product.id}`, quantity)
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

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await authService.login({ email, password })
      if (response && response.success) {
        setCurrentUserEmail(response.email)
        saveCurrentUserEmail(response.email)
        localStorage.setItem('currentUserName', response.name)
        
        // Thêm tài khoản vào state local khi login thành công để logic Frontend hoạt động khớp data
        if (!accounts.some(acc => acc.email === response.email)) {
          const nextAccounts = [...accounts, { name: response.name, email: response.email, savedAddress: null, orders: [] }]
          setAccounts(nextAccounts)
          saveAccounts(nextAccounts)
        }

        addToast({ type: 'success', title: 'Đăng nhập thành công', description: response.message || `Xin chào ${response.name}.` })
        return true
      }
      return false
    } catch (error) {
      addToast({ type: 'error', title: 'Đăng nhập thất bại', description: error.message || 'Có lỗi xảy ra khi đăng nhập' })
      return false
    }
  }

  const handleRegister = async ({ name, email, password }) => {
    try {
      const response = await authService.register({ name, email, password })
      if (response && response.success) {
        setCurrentUserEmail(response.email)
        saveCurrentUserEmail(response.email)
        localStorage.setItem('currentUserName', response.name)
        
        // Nhớ lưu state vào local để Giao diện Modal load được Object Profile
        const nextAccounts = [...accounts, { name: response.name, email: response.email, savedAddress: null, orders: [] }]
        setAccounts(nextAccounts)
        saveAccounts(nextAccounts)

        addToast({ type: 'success', title: 'Đăng ký thành công', description: response.message || 'Tài khoản đã được tạo.' })
        return true
      }
      return false
    } catch (error) {
      addToast({ type: 'error', title: 'Không thể đăng ký', description: error.message || 'Có lỗi xảy ra khi đăng ký' })
      return false
    }
  }

  const handleLogout = () => {
    setCurrentUserEmail(null)
    saveCurrentUserEmail(null)
    localStorage.removeItem('currentUserName')
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
