'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Moon, Sun, Package, Flame, Heart, Home, UserCircle, Bell
} from 'lucide-react';

import IntroSplash from './components/IntroSplash';
import StoreHeader from './components/StoreHeader';
import HeroSection from './components/HeroSection';
import ProductSection from './components/ProductSection';
import StoreOverlays from './components/StoreOverlays';

export const products = [
  { id:'p1', title:'Toppers (125g)', price:13.99, flavour:'Raspberry/chocolate', stock:20, image:'/pictures/biscuit.jpeg', category:'snacks' },
  { id:'p2', title:'Stumbo Lollipop', price:1.50, flavour:'Cherry', stock:100, image:'/pictures/stumbo1.jpeg', category:'candy' },
  { id:'p3', title:'Simba (120g)', price:19.99, flavour:'Mexican Chilli', stock:15, image:'/pictures/simbar1.jpeg', category:'snacks', trending:true },
  { id:'p4', title:'Noodles (70g)', price:7.50, flavour:'Beef/Chicken/Cheese', stock:50, image:'/pictures/noodles1.jpeg', special:true, category:'meals' },
  { id:'p5', title:'Cadbury Lunchbar', price:12.00, flavour:'Chocolate', stock:30, image:'/pictures/Lunchbar.jpeg', category:'snacks' },
  { id:'p6', title:'Energy Drink', price:18.50, flavour:'Original flavour', stock:25, image:'/pictures/playenergy1.jpeg', category:'drinks', new:true },
];

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'Sparkles' },
  { id: 'snacks', label: 'Snacks', icon: 'Package' },
  { id: 'candy', label: 'Candy', icon: 'Heart' },
  { id: 'meals', label: 'Meals', icon: 'Flame' },
  { id: 'drinks', label: 'Drinks', icon: 'Zap' },
];

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
}

// 🤖 Buy 10 Get 2 Free: returns free quantity for an item
export function getFreeQty(qty) {
  return Math.floor(qty / 10) * 2;
}

// 💰 Bulk discount: 10% off orders over R200
export function getBulkDiscount(subtotal) {
  return subtotal > 200 ? subtotal * 0.10 : 0;
}

// 🚚 Delivery fee: R5 lower campus, R10 upper campus if subtotal < R50
export function getDeliveryFee(subtotal, location) {
  if (subtotal >= 50) return 0;
  return location === 'upper' ? 10 : 5;
}

export default function HomePage() {
  const router = useRouter();

  const [dark, setDark] = useState(false);
  const [onCampus, setOnCampus] = useState(true);
  const [hotSale, setHotSale] = useState(null);
  const [cart, setCart] = useState([]);
  const [stock, setStock] = useState({});
  const [liked, setLiked] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', location: 'lower', pay: 'Cash on Delivery', comm: 'WhatsApp', notes: ''
  });

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLiked, setShowLiked] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [campusConfirmed, setCampusConfirmed] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hungerLevel, setHungerLevel] = useState(50);
  const [showIntro, setShowIntro] = useState(true);
  const [chatUsername, setChatUsername] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedDark = localStorage.getItem('vc_dark_mode') === 'true';
    setDark(savedDark);
    if (savedDark) document.documentElement.classList.add('dark');
    const campus = localStorage.getItem('vc_campus_status');
    if (campus !== null) setOnCampus(campus !== 'false');
    const sale = localStorage.getItem('vc_hot_sale');
    if (sale) {
      try {
        const parsed = JSON.parse(sale);
        if (parsed.active && new Date(parsed.endTime) > new Date()) setHotSale(parsed);
      } catch (e) {}
    }
    setCart(JSON.parse(localStorage.getItem('vc_cart') || '[]'));
    setStock(JSON.parse(localStorage.getItem('vc_stock') || '{}'));
    setLiked(JSON.parse(localStorage.getItem('vc_liked') || '[]'));
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) setChatUsername(savedUsername);
    const introShown = sessionStorage.getItem('intro_shown');
    if (introShown) setShowIntro(false);
  }, []);

  useEffect(() => { if (!mounted) return; localStorage.setItem('vc_dark_mode', dark.toString()); if (dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [dark, mounted]);
  useEffect(() => { if (!mounted) return; localStorage.setItem('vc_campus_status', onCampus.toString()); }, [onCampus, mounted]);
  useEffect(() => { if (!mounted) return; localStorage.setItem('vc_cart', JSON.stringify(cart)); }, [cart, mounted]);
  useEffect(() => { if (!mounted) return; localStorage.setItem('vc_stock', JSON.stringify(stock)); }, [stock, mounted]);
  useEffect(() => { if (!mounted) return; localStorage.setItem('vc_liked', JSON.stringify(liked)); }, [liked, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      const campus = localStorage.getItem('vc_campus_status');
      setOnCampus(campus !== 'false');
      const sale = localStorage.getItem('vc_hot_sale');
      if (sale) {
        try {
          const parsed = JSON.parse(sale);
          if (parsed.active && new Date(parsed.endTime) > new Date()) setHotSale(parsed);
          else { setHotSale(null); localStorage.removeItem('vc_hot_sale'); }
        } catch (e) { setHotSale(null); }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const featured = products.filter(p => p.trending || p.special || p.new);
      setFeaturedIndex(prev => (prev + 1) % (featured.length || 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getDiscountedPrice = (productId, originalPrice) => {
    if (!hotSale?.active) return originalPrice;
    if (hotSale.selectedProducts?.length > 0 && !hotSale.selectedProducts.includes(productId)) return originalPrice;
    return originalPrice * (1 - (hotSale.discount || 10) / 100);
  };

  const getStock = (id) => stock[id] ?? products.find(p => p.id === id)?.stock ?? 0;

  const addToCart = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const currentStock = getStock(id);
    if (currentStock <= 0) { alert("Out of stock 😭"); return; }
    const price = getDiscountedPrice(id, product.price);
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing) {
        const newQty = existing.qty + 1;
        const freeQty = getFreeQty(newQty);
        return prev.map(c => c.id === id ? { ...c, qty: newQty, freeQty, price } : c);
      }
      return [...prev, { ...product, qty: 1, freeQty: 0, price }];
    });
    setStock(prev => ({ ...prev, [id]: currentStock - 1 }));
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (id) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    setStock(prev => ({ ...prev, [id]: (prev[id] ?? 0) + item.qty }));
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const updateQty = (id, delta) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) { removeFromCart(id); return; }
    const currentStock = getStock(id);
    if (delta > 0 && currentStock <= 0) { alert("No more stock!"); return; }
    const freeQty = getFreeQty(newQty);
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: newQty, freeQty } : c));
    setStock(prev => ({ ...prev, [id]: currentStock - delta }));
  };

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleLogin = () => {
    const username = document.getElementById('loginUsername')?.value?.trim();
    if (!username) { alert("Enter a cool username!"); return; }
    const color = document.getElementById('avatarColor')?.value || '#ffadad';
    localStorage.setItem('chatUsername', username);
    localStorage.setItem('chatColor', color);
    setChatUsername(username);
    setShowLoginModal(false);
    alert(`Welcome ${username}! Now you can chat and order.`);
  };

  const openChat = () => {
    window.open('chat.html', '_blank', 'width=500,height=700');
  };

  // 💰 Calculated totals
  const cartSubtotal = cart.reduce((s, i) => s + i.price * (i.qty - (i.freeQty || 0)), 0);
  const bulkDiscount = getBulkDiscount(cartSubtotal);
  const discountedSubtotal = cartSubtotal - bulkDiscount;
  const deliveryFee = getDeliveryFee(discountedSubtotal, formData.location);
  const cartTotal = discountedSubtotal + deliveryFee + tipAmount;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const likedProducts = products.filter(p => liked.includes(p.id));
  const featuredProducts = products.filter(p => p.trending || p.special || p.new);
  const hasBulkPromo = cart.some(i => i.qty >= 10);

  const finalizeOrder = async () => {
    const orderId = `YAF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderData = {
      order_id: orderId,
      customer_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      location: formData.location,
      items: cart.map(i => ({ title: i.title, qty: i.qty, freeQty: i.freeQty || 0, price: i.price })),
      subtotal: cartSubtotal,
      bulk_discount: bulkDiscount,
      delivery_fee: deliveryFee,
      tip: tipAmount,
      total: cartTotal,
      payment_method: formData.pay,
      communication_method: formData.comm,
      notes: formData.notes,
      status: 'order_received',
      status_history: [{ status: 'order_received', time: new Date().toISOString() }],
      paid: false,
    };

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) { 
        const text = await res.text(); 
        console.error('Server error response:', text);
        throw new Error(`Server error ${res.status}: ${text}`); 
      }
      await res.json();
      setOrderPlaced(true);
      setTrackOrderId(orderId);
      setCart([]);
      localStorage.setItem('vc_cart', '[]');
      // 🚀 Fast redirect to tracker
      setTimeout(() => {
        router.push(`/tracker?order=${orderId}`);
      }, 800);
    } catch (err) {
      console.error('Order error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.');
      } else {
        alert('Order failed: ' + (err.message || 'Unknown error. Check console for details.'));
      }
    } finally { setLoading(false); }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) { alert("Cart is empty!"); return; }
    if (!campusConfirmed) { alert("Please confirm you are on campus!"); return; }

    const isOnlinePayment = ['EFT / PayShap', 'Online Payment'].includes(formData.pay);
    const needsBankDetails = cartTotal > 50 && isOnlinePayment;

    if (needsBankDetails) {
      setShowBankDetails(true);
      return;
    }

    // Cash or small order: place immediately
    finalizeOrder();
  };

  const handleBankDetailsPaid = () => {
    setShowBankDetails(false);
    finalizeOrder();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.flavour.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#10b981', fontSize: 14, animation: 'pulse 2s infinite' }}>Loading Agripreneurs Store...</div>
      </div>
    );
  }

  if (!onCampus) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>😴</div>
          <h1 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 800 }}>We're Off Campus</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>Orders are currently paused. Check back later!</p>
          <button onClick={() => window.location.reload()} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Check Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#0f172a' : '#f8fafc', color: dark ? '#fff' : '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25%); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 50% { transform: translateY(-12px) scale(1.05); opacity: 0.9; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"] { width: 100%; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.3); outline: none; -webkit-appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #ff9800; cursor: pointer; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4); }
        input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #ff9800; cursor: pointer; border: none; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4); }
      `}</style>

      {showIntro && (
        <IntroSplash dark={dark} onClose={() => { setShowIntro(false); sessionStorage.setItem('intro_shown', 'true'); }} onChat={() => setShowLoginModal(true)} />
      )}

      <StoreHeader
        dark={dark} scrollY={scrollY} cartCount={cartCount}
        showSearch={showSearch} setShowSearch={setShowSearch}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        setShowCart={setShowCart} setDark={setDark}
        showNotifications={showNotifications} setShowNotifications={setShowNotifications}
        notifications={notifications} setNotifications={setNotifications}
      />

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 16px 100px' }}>
        <HeroSection
          dark={dark} hotSale={hotSale} featuredProducts={featuredProducts}
          featuredIndex={featuredIndex} setFeaturedIndex={setFeaturedIndex}
          hungerLevel={hungerLevel} setHungerLevel={setHungerLevel}
          addToCart={addToCart} getDiscountedPrice={getDiscountedPrice}
          cartSubtotal={cartSubtotal} hasBulkPromo={hasBulkPromo}
        />

        <ProductSection
          dark={dark} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery} filteredProducts={filteredProducts}
          products={products} getStock={getStock} getDiscountedPrice={getDiscountedPrice}
          liked={liked} toggleLike={toggleLike} addToCart={addToCart}
          hotSale={hotSale} cart={cart}
        />
      </main>

      <StoreOverlays
        dark={dark} showCart={showCart} setShowCart={setShowCart}
        cart={cart} cartTotal={cartTotal} cartSubtotal={cartSubtotal}
        bulkDiscount={bulkDiscount} deliveryFee={deliveryFee} tipAmount={tipAmount}
        updateQty={updateQty} removeFromCart={removeFromCart}
        setCheckoutOpen={setCheckoutOpen} checkoutOpen={checkoutOpen}
        orderPlaced={orderPlaced} trackOrderId={trackOrderId} loading={loading}
        showTip={showTip} setShowTip={setShowTip} setTipAmount={setTipAmount}
        showBankDetails={showBankDetails} setShowBankDetails={setShowBankDetails}
        finalizeOrder={finalizeOrder} handleCheckout={handleCheckout}
        handleBankDetailsPaid={handleBankDetailsPaid}
        formData={formData} handleFormChange={handleFormChange}
        campusConfirmed={campusConfirmed} setCampusConfirmed={setCampusConfirmed}
        showLiked={showLiked} setShowLiked={setShowLiked} likedProducts={likedProducts}
        addToCart={addToCart} getDiscountedPrice={getDiscountedPrice}
        showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal}
        handleLogin={handleLogin} openChat={openChat} chatUsername={chatUsername}
        activeTab={activeTab} setActiveTab={setActiveTab} cartCount={cartCount} liked={liked}
      />
    </div>
  );
}
