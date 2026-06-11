'use client';

import Image from 'next/image';
import { Clock, MapPin, Truck, Sparkles, Zap, Bot } from 'lucide-react';

export default function HeroSection({
  dark, hotSale, featuredProducts, featuredIndex, setFeaturedIndex,
  hungerLevel, setHungerLevel, addToCart, getDiscountedPrice,
  cartSubtotal, hasBulkPromo
}) {
  return (
    <>
      {/* 🤖 AI Robot Promotions Banner */}
      <div style={{
        background: dark ? 'linear-gradient(135deg, #1e1b4b, #312e81)' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
        borderRadius: 20, padding: '16px 20px', marginBottom: 16,
        border: '1px solid ' + (dark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'),
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)', flexShrink: 0
          }}>
            <span style={{ fontSize: 24 }}>🤖</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: dark ? '#c7d2fe' : '#3730a3', marginBottom: 4 }}>
              🤖 Smart Deals Activated!
            </div>
            <div style={{ fontSize: 12, color: dark ? '#a5b4fc' : '#4338ca', lineHeight: 1.5 }}>
              Buy 10 of any item → Get 2 FREE! • Orders over R200 get 10% OFF!
            </div>
          </div>
        </div>
        {/* Decorative sparkles */}
        <div style={{ position: 'absolute', top: -10, right: 20, fontSize: 20, opacity: 0.3 }}>✨</div>
        <div style={{ position: 'absolute', bottom: -5, left: 60, fontSize: 16, opacity: 0.2 }}>⭐</div>
      </div>

      {/* Hot Sale Banner */}
      {hotSale?.active && (
        <div style={{
          background: 'linear-gradient(90deg, #7c2d12, #c2410c, #ea580c)',
          padding: '14px 20px', borderRadius: 16, marginBottom: 16,
          color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 8px 20px rgba(194, 65, 12, 0.3)'
        }}>
          🔥 HOT SALE: {hotSale.discount}% OFF {hotSale.selectedProducts?.length > 0 ? 'Selected Items' : 'Everything'}!
        </div>
      )}

      {/* Hero Banner */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 24,
        padding: '28px 24px', marginBottom: 20,
        background: 'linear-gradient(135deg, #059669, #0d9488, #0891b2)',
        color: '#fff', boxShadow: '0 20px 40px rgba(5, 150, 105, 0.25)'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 80, height: 80, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', transform: 'translate(-30%, 30%)', filter: 'blur(30px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            fontSize: 12, fontWeight: 600
          }}>
            <Truck size={14} /> Fast Delivery
          </div>
          <h2 style={{ margin: '12px 0 6px', fontSize: 26, fontWeight: 800 }}>Campus Delivery </h2>
          <p style={{ margin: '0 0 16px', fontSize: 14, opacity: 0.85 }}>Get snacks, drinks & more delivered to your res</p>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, opacity: 0.7 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> 15-45 Mins</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> On Campus</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          {[0,1,2].map(i => (
            <button key={i} style={{
              height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
              background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s', width: i === 0 ? 24 : 6
            }} />
          ))}
        </div>
      </div>

      {/* Hunger Meter */}
      <div style={{
        background: dark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(10px)', margin: '0 0 20px', padding: 15,
        borderRadius: 30, textAlign: 'center'
      }}>
        <span style={{ color: dark ? '#fff' : '#0f172a', fontWeight: 600 }}>🍔 How hungry? </span>
        <input
          type="range" min="0" max="100" value={hungerLevel}
          onChange={(e) => setHungerLevel(parseInt(e.target.value))}
          style={{ width: '100%', margin: '10px 0', cursor: 'pointer', accentColor: '#ff9800' }}
        />
        <span style={{ color: dark ? '#fff' : '#0f172a', fontWeight: 600, display: 'inline-block', marginTop: 8 }}>
          {hungerLevel < 30 ? '🥱 not very hungry' : hungerLevel < 70 ? '😋 medium hungry' : '🤯 STARVING! order fast!'}
        </span>
      </div>

      {/* Video Section */}
      <div style={{ background: '#1e1e1e', padding: 20, marginBottom: 20, borderRadius: 20 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', justifyContent: 'center' }}>
          {[
            { src: 'videos/noodles.mp4', label: '🍜 Noodle dreams' },
            { src: 'videos/simba.mp4', label: '🥨 Crunch attack' },
            { src: 'videos/biscuits.mp4', label: '🍪 Biscuit vibes' }
          ].map((v, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <video autoPlay loop muted playsInline style={{ width: '100%', display: 'block', borderRadius: '16px 16px 0 0' }} src={v.src} />
              <p style={{ color: '#fff', padding: '8px', margin: 0, fontSize: 12, fontWeight: 600 }}>{v.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🤖 Bulk Promo Banner (if items in cart qualify) */}
      {hasBulkPromo && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669, #047857)',
          borderRadius: 20, padding: '14px 18px', marginBottom: 20,
          color: '#fff', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Bulk Bonus Unlocked!</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>You have 10+ of an item — 2 FREE added to your order!</div>
          </div>
        </div>
      )}

      {/* 💰 R200+ Discount Banner */}
      {cartSubtotal > 200 && (
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
          borderRadius: 20, padding: '14px 18px', marginBottom: 20,
          color: '#fff', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
        }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>10% Bulk Discount Applied!</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Orders over R200 get 10% OFF — You saved R{(cartSubtotal * 0.10).toFixed(2)}!</div>
          </div>
        </div>
      )}

      {/* Featured Carousel */}
      {featuredProducts.length > 0 && (
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 24,
          padding: '24px 20px', marginBottom: 20,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
          color: '#fff', boxShadow: '0 20px 40px rgba(124, 58, 237, 0.25)'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
              fontSize: 12, fontWeight: 600, marginBottom: 10
            }}>
              {featuredProducts[featuredIndex]?.new ? 'New Arrival' : featuredProducts[featuredIndex]?.trending ? 'Trending 🔥' : 'Special Offer'}
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>{featuredProducts[featuredIndex]?.title}</h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, opacity: 0.85 }}>{featuredProducts[featuredIndex]?.flavour}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                R{getDiscountedPrice(featuredProducts[featuredIndex]?.id, featuredProducts[featuredIndex]?.price).toFixed(2)}
              </span>
              <button
                onClick={() => addToCart(featuredProducts[featuredIndex]?.id)}
                style={{
                  padding: '10px 20px', borderRadius: 20, border: 'none',
                  background: '#fff', color: '#7c3aed', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
            {featuredProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setFeaturedIndex(i)}
                style={{
                  height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
                  background: i === featuredIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s', width: i === featuredIndex ? 24 : 6
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
