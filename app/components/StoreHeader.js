'use client';

import Image from 'next/image';
import { Search, ShoppingCart, Sun, Moon, Bell, X } from 'lucide-react';

export default function StoreHeader({
  dark, scrollY, cartCount, showSearch, setShowSearch,
  searchQuery, setSearchQuery, setShowCart, setDark,
  showNotifications, setShowNotifications, notifications, setNotifications
}) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrollY > 50
        ? (dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.95)')
        : 'transparent',
      backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
      borderBottom: scrollY > 50
        ? (dark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)')
        : 'none',
      transition: 'all 0.3s'
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 16,
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
          }}>
            <Image src="/pictures/profile.jpeg" alt="YAF" width={32} height={32} style={{ borderRadius: 10 }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: dark ? '#fff' : '#0f172a' }}>
              Young Agripreneurs Store
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: dark ? '#94a3b8' : '#64748b' }}>
              {new Date().getHours() < 12 ? 'Good Morning ☀️' : new Date().getHours() < 17 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowSearch(!showSearch)} style={iconBtnStyle(dark)}>
            <Search size={20} />
          </button>
          <button onClick={() => setShowNotifications(!showNotifications)} style={iconBtnStyle(dark)}>
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            )}
          </button>
          <button onClick={() => setShowCart(true)} style={{ ...iconBtnStyle(dark), position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%',
                background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{cartCount}</span>
            )}
          </button>
          <button onClick={() => setDark(!dark)} style={iconBtnStyle(dark)}>
            {dark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {showSearch && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
          borderRadius: 20, margin: '0 16px 12px',
          background: dark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.9)',
          border: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          <Search size={18} color={dark ? '#94a3b8' : '#64748b'} />
          <input
            type="text" placeholder="Search snacks, drinks..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: dark ? '#fff' : '#0f172a', fontSize: 14 }}
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={16} color={dark ? '#94a3b8' : '#64748b'} />
            </button>
          )}
        </div>
      )}

      {showNotifications && (
        <div style={{ position: 'fixed', top: 80, left: 16, right: 16, zIndex: 50, maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            background: dark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)', borderRadius: 24, padding: 16,
            border: dark ? '1px solid rgba(51, 65, 85, 0.4)' : '1px solid rgba(226, 232, 240, 0.6)',
            maxHeight: 320, overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Notifications</h3>
              <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: dark ? '#94a3b8' : '#64748b', padding: '20px 0' }}>No notifications yet</p>
            ) : (
              notifications.map((n, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 12, background: dark ? 'rgba(51, 65, 85, 0.4)' : '#f8fafc', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, color: dark ? '#fff' : '#0f172a' }}>{n}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function iconBtnStyle(dark) {
  return {
    width: 40, height: 40, borderRadius: '50%',
    background: dark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.9)',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b',
    transition: 'transform 0.15s', position: 'relative'
  };
}
