'use client';

import Image from 'next/image';
import { Sparkles, Package, Heart, Flame, Zap, Plus } from 'lucide-react';

const iconMap = { Sparkles, Package, Heart, Flame, Zap };

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'Sparkles' },
  { id: 'snacks', label: 'Snacks', icon: 'Package' },
  { id: 'candy', label: 'Candy', icon: 'Heart' },
  { id: 'meals', label: 'Meals', icon: 'Flame' },
  { id: 'drinks', label: 'Drinks', icon: 'Zap' },
];

export default function ProductSection({
  dark, selectedCategory, setSelectedCategory, searchQuery,
  filteredProducts, products, getStock, getDiscountedPrice,
  liked, toggleLike, addToCart, hotSale, cart
}) {
  return (
    <>
      {/* Categories */}
      {!searchQuery && (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', marginBottom: 20 }} className="hide-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = iconMap[cat.icon];
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.3s',
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981, #0d9488)'
                    : (dark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255,255,255,0.8)'),
                  color: isActive ? '#fff' : (dark ? '#94a3b8' : '#475569'),
                  boxShadow: isActive ? '0 8px 20px rgba(16, 185, 129, 0.3)' : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Products Grid */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>
            {searchQuery ? 'Search Results' : selectedCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
          </h2>
          <span style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b' }}>{filteredProducts.length} items</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {filteredProducts.map(product => {
            const discountedPrice = getDiscountedPrice(product.id, product.price);
            const isOnSale = discountedPrice < product.price;
            const currentStock = getStock(product.id);
            const isLiked = liked.includes(product.id);
            const inStock = currentStock > 0;
            const cartItem = cart.find(c => c.id === product.id);
            const hasBulkInCart = cartItem && cartItem.qty >= 10;

            return (
              <div key={product.id} style={{
                background: dark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)', borderRadius: 24, overflow: 'hidden',
                border: dark ? '1px solid rgba(51, 65, 85, 0.4)' : '1px solid rgba(226, 232, 240, 0.6)',
                boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s'
              }}>
                <div style={{ position: 'relative', aspectRatio: '1', background: dark ? '#1e293b' : '#f1f5f9', overflow: 'hidden' }}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                  {product.special && (
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      padding: '4px 12px', borderRadius: 12,
                      background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                      color: '#fff', fontSize: 10, fontWeight: 700, zIndex: 2,
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                    }}>SPECIAL</div>
                  )}
                  {product.new && (
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      padding: '4px 12px', borderRadius: 12,
                      background: 'linear-gradient(90deg, #10b981, #14b8a6)',
                      color: '#fff', fontSize: 10, fontWeight: 700, zIndex: 2,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}>NEW</div>
                  )}
                  {isOnSale && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      padding: '4px 12px', borderRadius: 12,
                      background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                      color: '#fff', fontSize: 10, fontWeight: 700, zIndex: 2,
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                    }}>-{hotSale.discount}%</div>
                  )}

                  {/* 🤖 Bulk Promo Badge */}
                  <div style={{
                    position: 'absolute', bottom: 10, left: 10,
                    padding: '4px 10px', borderRadius: 12,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontSize: 10, fontWeight: 700, zIndex: 2,
                    display: 'flex', alignItems: 'center', gap: 4,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}>
                    <span>🤖</span> Buy 10 Get 2
                  </div>

                  <button
                    onClick={() => toggleLike(product.id)}
                    style={{
                      position: 'absolute', top: 10,
                      right: isOnSale ? 60 : 10,
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 3
                    }}
                  >
                    <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#94a3b8'} />
                  </button>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#0f172a', lineHeight: 1.3 }}>{product.title}</h3>
                  <p style={{ margin: '4px 0 10px', fontSize: 12, color: dark ? '#94a3b8' : '#64748b' }}>{product.flavour}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>R{discountedPrice.toFixed(2)}</span>
                    {isOnSale && (
                      <span style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8', textDecoration: 'line-through' }}>R{product.price.toFixed(2)}</span>
                    )}
                  </div>

                  {/* 🤖 Bulk Promo Message */}
                  {hasBulkInCart && (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#6366f1',
                      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span>🤖</span> {cartItem.freeQty}x FREE unlocked!
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11,
                      color: currentStock > 5 ? '#10b981' : currentStock > 0 ? '#f59e0b' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {currentStock > 0 ? `${currentStock} left` : 'Out of stock'}
                    </span>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={!inStock}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', border: 'none',
                        background: inStock ? 'linear-gradient(135deg, #10b981, #0d9488)' : (dark ? '#334155' : '#e2e8f0'),
                        color: inStock ? '#fff' : (dark ? '#64748b' : '#94a3b8'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: inStock ? 'pointer' : 'not-allowed',
                        boxShadow: inStock ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                        transition: 'transform 0.15s'
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: dark ? '#94a3b8' : '#64748b' }}>
            <p style={{ fontWeight: 600 }}>No products found</p>
            <p style={{ fontSize: 13 }}>Try a different search or category</p>
          </div>
        )}
      </div>
    </>
  );
}
