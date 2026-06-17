'use client';

import Image from 'next/image';
import {
  ShoppingCart, X, Minus, Plus, Heart, Home, Package,
  MessageCircle, UserCircle, CheckCircle, CreditCard, Banknote, Smartphone, Zap
} from 'lucide-react';

const BANK_DETAILS = {
  bank: 'FNB / Capitec',
  accountName: 'Young Agripreneurs',
  accountNumber: '1234567890',
  branchCode: '250655',
  payshapNumber: '0821234567',
  capitecCell: '0821234567',
};

export default function StoreOverlays({
  dark, showCart, setShowCart, cart, cartTotal, cartSubtotal,
  bulkDiscount, deliveryFee, tipAmount,
  updateQty, removeFromCart,
  setCheckoutOpen, checkoutOpen,
  orderPlaced, trackOrderId, loading,
  showTip, setShowTip, setTipAmount,
  showBankDetails, setShowBankDetails,
  finalizeOrder, handleCheckout, handleBankDetailsPaid,
  formData, handleFormChange,
  campusConfirmed, setCampusConfirmed,
  showLiked, setShowLiked, likedProducts, addToCart, getDiscountedPrice,
  showLoginModal, setShowLoginModal, handleLogin, openChat, chatUsername,
  activeTab, setActiveTab, cartCount, liked,
  // NEW CPC PROPS
  cashPassCode, setCashPassCode, cpcData, megaShopping, validateCPC,
  pointsDiscount, allowCOD
}) {
  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={openChat}
        style={{
          position: 'fixed', bottom: 90, left: 16, zIndex: 40,
          width: 60, height: 60, borderRadius: '50%', border: 'none',
          background: '#25D366', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          transition: 'transform 0.15s', fontSize: 28
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </button>

      {/* Cart FAB */}
      {cartCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed', bottom: 90, right: 16, zIndex: 40,
            width: 60, height: 60, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #0d9488)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            transition: 'transform 0.15s'
          }}
        >
          <ShoppingCart size={24} />
          <span style={{
            position: 'absolute', top: -4, right: -4, width: 22, height: 22,
            borderRadius: '50%', background: '#ef4444', color: '#fff',
            fontSize: 11, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>{cartCount}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
          }} onClick={() => setShowCart(false)} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh',
            background: dark ? '#0f172a' : '#fff', borderRadius: '24px 24px 0 0',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px',
              borderBottom: dark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)'
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: dark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={22} /> Your Cart ({cartCount})
              </h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: dark ? '#94a3b8' : '#64748b' }}>
                  <ShoppingCart size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                      borderRadius: 20, marginBottom: 10,
                      background: dark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc'
                    }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', position: 'relative', background: dark ? '#334155' : '#e2e8f0', flexShrink: 0 }}>
                        <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: dark ? '#fff' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                        <div style={{ color: '#10b981', fontSize: 13, marginTop: 2 }}>R{item.price.toFixed(2)}</div>
                        <div style={{ color: '#10b981', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                          R{(item.price * (item.qty - (item.freeQty || 0))).toFixed(2)}
                          {(item.freeQty || 0) > 0 && (
                            <span style={{ color: '#6366f1', fontSize: 12, marginLeft: 6 }}>🤖 +{item.freeQty} FREE</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={qtyBtnStyle('minus', dark)}>
                          <Minus size={14} color={dark ? '#94a3b8' : '#64748b'} />
                        </button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14, color: dark ? '#fff' : '#0f172a' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={qtyBtnStyle('plus', dark)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{
                padding: '16px 20px',
                borderTop: dark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)'
              }}>
                {/* Price Breakdown */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
                    <span>Subtotal</span>
                    <span style={{ color: dark ? '#fff' : '#0f172a' }}>R{cartSubtotal.toFixed(2)}</span>
                  </div>
                  {bulkDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#6366f1' }}>
                      <span>🤖 Bulk Discount (10%)</span>
                      <span style={{ fontWeight: 700 }}>-R{bulkDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
                      <span>🚚 Delivery Fee ({formData.location === 'upper' ? 'Upper Campus' : 'Lower Campus'})</span>
                      <span style={{ color: dark ? '#fff' : '#0f172a' }}>R{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee === 0 && cartSubtotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#10b981' }}>
                      <span>🚚 Delivery</span>
                      <span style={{ fontWeight: 700 }}>FREE (R50+ order)</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
                      <span>💚 Tip</span>
                      <span style={{ color: dark ? '#fff' : '#0f172a' }}>R{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#3b82f6' }}>
                      <span>💎 Points Discount</span>
                      <span style={{ fontWeight: 700 }}>-R{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
                    <span style={{ color: dark ? '#fff' : '#0f172a' }}>Total</span>
                    <span style={{ color: '#10b981' }}>R{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={() => { setShowCart(false); setCheckoutOpen(true); }} style={{
                  width: '100%', padding: '18px 24px', borderRadius: 20, border: 'none',
                  background: 'linear-gradient(90deg, #10b981, #0d9488, #0891b2)',
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)', transition: 'transform 0.15s'
                }}>
                  Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && !orderPlaced && !showBankDetails && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 16px 16px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => !loading && setCheckoutOpen(false)} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 480,
            background: dark ? '#0f172a' : '#fff', borderRadius: 24,
            padding: 24, maxHeight: '90vh', overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Checkout</h2>
              <button onClick={() => setCheckoutOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b' }}>
                <X size={24} />
              </button>
            </div>

            {/* MEGA / NORMAL Shopping Indicator */}
            <div style={{
              marginBottom: 16, padding: 12, borderRadius: 14,
              background: megaShopping ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : (dark ? 'rgba(51,65,85,0.4)' : '#f1f5f9'),
              color: megaShopping ? '#fff' : (dark ? '#94a3b8' : '#64748b'),
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700
            }}>
              <span style={{ fontSize: 20 }}>{megaShopping ? '💎' : '💻'}</span>
              {megaShopping ? `MEGA Shopping — CPC ${cpcData?.code} (Cat ${cpcData?.category})` : 'Normal Shopping — Enter CPC to unlock Mega Shopping'}
            </div>

            {showTip ? (
              <div>
                <h2 style={{ margin: '0 0 20px', textAlign: 'center', fontSize: 18, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Add a Tip? 💚</h2>
                <p style={{ textAlign: 'center', color: dark ? '#94a3b8' : '#64748b', marginBottom: 24, fontSize: 14 }}>Support your delivery driver</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                  {[5, 10, 15, 20].map(amount => {
                    const isSelected = tipAmount === amount;
                    return (
                      <button key={amount} onClick={() => setTipAmount(amount)} style={{
                        padding: '14px 22px', borderRadius: 16, border: 'none',
                        background: isSelected ? 'linear-gradient(135deg, #10b981, #0d9488)' : (dark ? 'rgba(51, 65, 85, 0.8)' : '#f1f5f9'),
                        color: isSelected ? '#fff' : (dark ? '#94a3b8' : '#475569'),
                        fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                      }}>
                        R{amount}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowTip(false)} style={{
                    flex: 1, padding: 14, borderRadius: 16,
                    border: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)',
                    background: 'transparent', color: dark ? '#94a3b8' : '#64748b',
                    cursor: 'pointer', fontWeight: 600
                  }}>
                    Skip
                  </button>
                  <button onClick={() => setShowTip(false)} style={{
                    flex: 1, padding: 14, borderRadius: 16, border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #0d9488)', color: '#fff',
                    cursor: 'pointer', fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input name="name" placeholder="Full Name" required value={formData.name} onChange={handleFormChange} style={inputStyle(dark)} />
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleFormChange} style={inputStyle(dark)} />
                <input name="phone" type="tel" placeholder="Phone Number" required value={formData.phone} onChange={handleFormChange} style={inputStyle(dark)} />
                <input name="address" placeholder="Res Name & Room Number" required value={formData.address} onChange={handleFormChange} style={inputStyle(dark)} />

                {/* 🚚 Campus Location — ALWAYS REQUIRED */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: dark ? '#94a3b8' : '#64748b', marginBottom: 6, fontWeight: 500 }}>Campus Location</label>
                  <select name="location" value={formData.location} onChange={handleFormChange} style={selectStyle(dark)}>
                    <option value="lower">Lower Campus (R5 delivery if &lt; R50)</option>
                    <option value="upper">Upper Campus (R10 delivery if &lt; R50)</option>
                  </select>
                </div>

                {/* Delivery Fee Explanation */}
                <div style={{
                  padding: 12, borderRadius: 12,
                  background: cartSubtotal >= 50 ? (dark ? 'rgba(16,185,129,0.15)' : '#f0fdf4') : (dark ? 'rgba(245,158,11,0.15)' : '#fffbeb'),
                  border: cartSubtotal >= 50 ? '1px solid #10b981' : '1px solid #f59e0b'
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: cartSubtotal >= 50 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                    {cartSubtotal >= 50
                      ? '🎉 Delivery is FREE for orders over R50!'
                      : `🚚 Delivery fee: R${deliveryFee} applies to orders under R50. Add R${(50 - cartSubtotal).toFixed(2)} more for FREE delivery!`}
                  </p>
                </div>

                {/* 💎 Cash Pass Code Input */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: dark ? '#94a3b8' : '#64748b', marginBottom: 6, fontWeight: 500 }}>
                    Cash Pass Code (Optional) — Unlock Mega Shopping & COD on large orders
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={cashPassCode}
                      onChange={(e) => setCashPassCode(e.target.value)}
                      placeholder="e.g. geo683#YA2"
                      style={{ ...inputStyle(dark), flex: 1, textTransform: 'lowercase' }}
                    />
                    <button
                      type="button"
                      onClick={() => validateCPC(cashPassCode)}
                      style={{
                        padding: '14px 18px', borderRadius: 16, border: 'none',
                        background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {megaShopping && cpcData && (
                    <div style={{
                      marginTop: 8, padding: 10, borderRadius: 10,
                      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                      color: '#fff', fontSize: 12, fontWeight: 700
                    }}>
                      ✓ MEGA Shopping Active! Category {cpcData.category} • Points: {cpcData.points?.points_balance || 0}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: dark ? '#94a3b8' : '#64748b', marginBottom: 6, fontWeight: 500 }}>Payment Method</label>
                  <select name="pay" value={formData.pay} onChange={handleFormChange} style={selectStyle(dark)}>
                    <option>Cash on Delivery</option>
                    <option>EFT / PayShap</option>
                    <option>Scan to Pay</option>
                    <option>Online Payment</option>
                  </select>
                  {!allowCOD && formData.pay === 'Cash on Delivery' && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                      ❌ Cash on Delivery is only available for orders under R50 or with a valid Cash Pass Code.
                    </p>
                  )}
                  {allowCOD && formData.pay === 'Cash on Delivery' && cartSubtotal > 50 && megaShopping && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
                      ✓ CPC approved — Cash on Delivery allowed for this order total.
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: dark ? '#94a3b8' : '#64748b', marginBottom: 6, fontWeight: 500 }}>Communication</label>
                  <select name="comm" value={formData.comm} onChange={handleFormChange} style={selectStyle(dark)}>
                    <option>WhatsApp</option>
                    <option>Phone Call</option>
                    <option>SMS</option>
                  </select>
                </div>

                <textarea name="notes" placeholder="Delivery notes (optional)" rows={3} value={formData.notes} onChange={handleFormChange} style={{ ...inputStyle(dark), resize: 'vertical' }} />

                <label style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                  borderRadius: 16, background: dark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <input type="checkbox" checked={campusConfirmed} onChange={(e) => setCampusConfirmed(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#10b981' }} />
                  <span style={{ fontSize: 14, color: dark ? '#fff' : '#0f172a' }}>I confirm I am currently on campus</span>
                </label>

                {/* 💰 Price Summary in Checkout */}
                <div style={{
                  padding: 16, borderRadius: 16,
                  background: dark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
                  marginTop: 4
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
                    <span>Subtotal</span>
                    <span style={{ color: dark ? '#fff' : '#0f172a' }}>R{cartSubtotal.toFixed(2)}</span>
                  </div>
                  {bulkDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#6366f1' }}>
                      <span>🤖 Bulk Discount (10%)</span>
                      <span style={{ fontWeight: 700 }}>-R{bulkDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
                      <span>🚚 Delivery Fee</span>
                      <span style={{ color: dark ? '#fff' : '#0f172a' }}>R{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee === 0 && cartSubtotal >= 50 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#10b981' }}>
                      <span>🚚 Delivery</span>
                      <span style={{ fontWeight: 700 }}>FREE</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
                      <span>💚 Tip</span>
                      <span style={{ color: dark ? '#fff' : '#0f172a' }}>R{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#3b82f6' }}>
                      <span>💎 Points Discount</span>
                      <span style={{ fontWeight: 700 }}>-R{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
                    <span style={{ color: dark ? '#fff' : '#0f172a' }}>Total</span>
                    <span style={{ color: '#10b981' }}>R{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" style={{
                  width: '100%', padding: '18px 24px', borderRadius: 20, border: 'none',
                  background: 'linear-gradient(90deg, #10b981, #0d9488, #0891b2)',
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)', marginTop: 8
                }}>
                  {loading ? 'Processing...' : 'Place Order →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🏦 Bank Details Popup (for >R50 online orders) */}
      {showBankDetails && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 250,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} onClick={() => setShowBankDetails(false)} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 420,
            background: dark ? '#1e293b' : '#fff', borderRadius: 24,
            padding: 28, boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28
            }}>
              🏦
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>
              Complete Your Payment
            </h2>
            <p style={{ color: dark ? '#94a3b8' : '#64748b', margin: '0 0 20px', fontSize: 14 }}>
              Order total: <strong style={{ color: '#10b981' }}>R{cartTotal.toFixed(2)}</strong>
            </p>

            <div style={{
              background: dark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
              borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Banknote size={20} color="#10b981" />
                <span style={{ fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Bank Transfer</span>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Bank</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>{BANK_DETAILS.bank}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Account Name</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>{BANK_DETAILS.accountName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Account Number</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>{BANK_DETAILS.accountNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Branch Code</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#0f172a', fontFamily: 'monospace' }}>{BANK_DETAILS.branchCode}</div>
                </div>
              </div>

              <div style={{ borderTop: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)', marginTop: 16, paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Smartphone size={20} color="#8b5cf6" />
                  <span style={{ fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>PayShap / Cellphone Pay</span>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>PayShap Number</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>{BANK_DETAILS.payshapNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Capitec Cellphone Pay</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>{BANK_DETAILS.capitecCell}</div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 16, padding: 12, borderRadius: 12,
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                color: '#92400e', fontSize: 12, fontWeight: 600
              }}>
                ⚠️ Please use your Order ID as reference after payment
              </div>
            </div>

            <button
              onClick={handleBankDetailsPaid}
              disabled={loading}
              style={{
                width: '100%', padding: '18px 24px', borderRadius: 20, border: 'none',
                background: 'linear-gradient(90deg, #10b981, #0d9488)',
                color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)', opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : "I've Paid — Place Order ✓"}
            </button>
            <button
              onClick={() => setShowBankDetails(false)}
              style={{
                width: '100%', marginTop: 10, padding: 12, borderRadius: 16,
                border: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)',
                background: 'transparent', color: dark ? '#94a3b8' : '#64748b',
                cursor: 'pointer', fontWeight: 600, fontSize: 14
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Order Success */}
      {orderPlaced && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 16px 16px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 480,
            background: dark ? '#0f172a' : '#fff', borderRadius: 24,
            padding: 24, textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>Order Placed!</h2>
            <p style={{ color: dark ? '#94a3b8' : '#64748b', margin: '0 0 12px' }}>Redirecting to tracker...</p>
            <div style={{
              fontFamily: 'monospace', fontSize: 14,
              background: dark ? 'rgba(51,65,85,0.4)' : '#f1f5f9',
              padding: 12, borderRadius: 12
            }}>{trackOrderId}</div>
          </div>
        </div>
      )}

      {/* Liked Modal */}
      {showLiked && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowLiked(false)} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh',
            background: dark ? '#0f172a' : '#fff', borderRadius: '24px 24px 0 0',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px',
              borderBottom: dark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)'
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: dark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={22} fill="#ef4444" color="#ef4444" /> Liked Items
              </h2>
              <button onClick={() => setShowLiked(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {likedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: dark ? '#94a3b8' : '#64748b' }}>
                  <Heart size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <p>No liked items yet</p>
                </div>
              ) : (
                likedProducts.map(product => (
                  <div key={product.id} style={{
                    display: 'flex', gap: 12, alignItems: 'center', padding: 12,
                    borderRadius: 16, marginBottom: 10,
                    background: dark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc'
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', position: 'relative', background: dark ? '#334155' : '#e2e8f0', flexShrink: 0 }}>
                      <Image src={product.image} alt={product.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: dark ? '#fff' : '#0f172a' }}>{product.title}</div>
                      <div style={{ color: '#10b981', fontSize: 14, fontWeight: 700, marginTop: 2 }}>R{getDiscountedPrice(product.id, product.price).toFixed(2)}</div>
                    </div>
                    <button onClick={() => addToCart(product.id)} style={{
                      padding: '10px 18px', borderRadius: 14, border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #0d9488)', color: '#fff',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setShowLoginModal(false)}>
          <div style={{
            background: dark ? '#1e2a3e' : '#ffffff', borderRadius: 30,
            padding: 25, maxWidth: 350, width: '100%', textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: dark ? '#fff' : '#1e2a3e', marginBottom: 16 }}>🙌 Join the Vibe</h3>
            <input id="loginUsername" type="text" placeholder="Choose a username" style={{ ...inputStyle(dark), marginBottom: 12 }} />
            <select id="avatarColor" style={{ ...selectStyle(dark), marginBottom: 16 }}>
              <option value="#ffadad">🍓 Strawberry</option>
              <option value="#9bf6ff">💙 Mint</option>
              <option value="#fdffb6">🍋 Lemon</option>
              <option value="#caffbf">🍏 Green</option>
              <option value="#bdb2ff">🍇 Grape</option>
            </select>
            <button onClick={handleLogin} style={{
              width: '100%', padding: '18px 24px', borderRadius: 20, border: 'none',
              background: '#ff9800', color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', marginBottom: 12
            }}>
              Enter Chat & Shop
            </button>
            <p style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b', margin: 0 }}>
              No password? No problem. Just create a cool username
            </p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: dark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
          <NavItem icon={Home} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} dark={dark} />
          <NavItem icon={Heart} label="Liked" isActive={activeTab === 'liked'} onClick={() => setShowLiked(true)} dark={dark} badge={liked.length} />
          <NavItem icon={ShoppingCart} label="Cart" isActive={activeTab === 'cart'} onClick={() => setShowCart(true)} dark={dark} badge={cartCount} badgeColor="#10b981" />
          <NavItem icon={Package} label="Orders" isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} dark={dark} />
          <NavItem icon={UserCircle} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} dark={dark} />
        </div>
      </nav>

      <div style={{ height: 32 }} />
    </>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick, dark, badge, badgeColor }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      padding: '8px 16px', borderRadius: 16, border: 'none', background: 'transparent',
      cursor: 'pointer', color: isActive ? '#10b981' : (dark ? '#64748b' : '#94a3b8'),
      transition: 'all 0.2s', transform: isActive ? 'scale(1.1)' : 'scale(1)',
      position: 'relative'
    }}>
      <div style={{ position: 'relative' }}>
        <Icon size={24} />
        {badge > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -10, minWidth: 16, height: 16,
            borderRadius: 8, background: badgeColor || '#ef4444', color: '#fff',
            fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px'
          }}>{badge}</span>
        )}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function inputStyle(dark) {
  return {
    width: '100%', padding: '14px 18px', borderRadius: 16,
    border: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)',
    background: dark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
    color: dark ? '#fff' : '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box'
  };
}

function selectStyle(dark) {
  return {
    width: '100%', padding: '14px 18px', borderRadius: 16,
    border: dark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.5)',
    background: dark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
    color: dark ? '#fff' : '#0f172a', fontSize: 14, outline: 'none'
  };
}

function qtyBtnStyle(type, dark) {
  return {
    width: 32, height: 32, borderRadius: '50%', border: 'none',
    background: type === 'minus' ? (dark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #10b981, #0d9488)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer'
  };
}
