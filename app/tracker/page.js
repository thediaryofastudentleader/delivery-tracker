'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const STATUS_STEPS = [
  { id: 'order_received', label: 'Order Received', icon: '📋', description: "We've got your order", eta: 35, mapPos: { left: '8%', top: '82%' } },
  { id: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'The kitchen is on it', eta: 30, mapPos: { left: '18%', top: '72%' } },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', description: 'Your driver picked up the order', eta: 20, mapPos: { left: '32%', top: '58%' } },
  { id: '10_mins_away', label: '10 Mins Away', icon: '⏰', description: 'Your driver is 10 minutes away', eta: 10, mapPos: { left: '52%', top: '42%' } },
  { id: '5_mins_away', label: '5 Mins Away', icon: '⏱️', description: 'Just 5 more minutes!', eta: 5, mapPos: { left: '70%', top: '28%' } },
  { id: 'driver_outside', label: 'Driver is Outside', icon: '📍', description: 'Your driver has arrived!', eta: 0, mapPos: { left: '86%', top: '16%' } },
  { id: 'delivered', label: 'Delivered', icon: '🎉', description: 'Enjoy your meal!', eta: 0, mapPos: { left: '86%', top: '16%' } },
];

const BANK_DETAILS = {
  bank: 'FNB / Capitec',
  accountName: 'Young Agripreneurs',
  accountNumber: '1234567890',
  branchCode: '250655',
  payshapNumber: '0821234567',
  capitecCell: '0821234567',
};

export default function TrackerPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(false);
  const prevStatusRef = useRef(null);
  const subRef = useRef(null);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const chatEndRef = useRef(null);
  const chatSubRef = useRef(null);

  const orderId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('order') : '';

  const showToastMsg = useCallback((msg, kind = '') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch order
  const fetchOrder = useCallback(async () => {
    if (!orderId || !supabase) return;
    const { data, error } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
    if (error || !data) {
      setError('Order not found.');
    } else {
      // Show toast on status change
      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        const step = STATUS_STEPS.find(s => s.id === data.status);
        if (step) showToastMsg(`📦 ${step.label} — ${step.description}`);
        if (data.status === 'delivered') showToastMsg('🎉 Order delivered! Enjoy your meal!', 'success');
      }
      prevStatusRef.current = data.status;
      setOrder(data);
    }
    setLoading(false);
  }, [orderId, showToastMsg]);

  useEffect(() => {
    if (!orderId) { setError('No order ID provided.'); setLoading(false); return; }
    if (!supabase) { setError('Supabase not configured.'); setLoading(false); return; }

    fetchOrder();

    // Real-time subscription
    const channel = supabase.channel(`order-${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `order_id=eq.${orderId}` }, (payload) => {
        setOrder(payload.new);
        if (prevStatusRef.current && prevStatusRef.current !== payload.new.status) {
          const step = STATUS_STEPS.find(s => s.id === payload.new.status);
          if (step) showToastMsg(`📦 ${step.label} — ${step.description}`);
          if (payload.new.status === 'delivered') showToastMsg('🎉 Order delivered! Enjoy your meal!', 'success');
        }
        prevStatusRef.current = payload.new.status;
      })
      .subscribe();

    subRef.current = channel;

    // Dark mode
    const savedDark = localStorage.getItem('vc_dark_mode') === 'true';
    setDark(savedDark);

    return () => {
      if (subRef.current) supabase.removeChannel(subRef.current);
    };
  }, [orderId, fetchOrder, showToastMsg]);

  // Chat logic
  const ensureAndOpenChat = async () => {
    if (!order || !supabase) return;
    setShowChat(true);
    let { data: conv } = await supabase.from('chat_conversations').select('*').eq('order_id', order.order_id).single();
    if (!conv) {
      const { data: newConv } = await supabase.from('chat_conversations').insert({ order_id: order.order_id, title: `Order ${order.order_id}` }).select().single();
      conv = newConv;
    }
    setConversationId(conv.id);
    const { data: msgs } = await supabase.from('chat_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
    setChatMessages(msgs || []);
    if (chatSubRef.current) supabase.removeChannel(chatSubRef.current);
    const channel = supabase.channel(`tracker-chat-${conv.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conv.id}` }, payload => {
      setChatMessages(prev => [...prev, payload.new]);
    }).subscribe();
    chatSubRef.current = channel;
  };

  const sendCustomerMessage = async () => {
    if (!newMessage.trim() || !conversationId || !order || !supabase) return;
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId, order_id: order.order_id,
      sender_name: order.customer_name || 'Customer', sender_role: 'customer',
      message_type: 'text', content: newMessage
    });
    setNewMessage('');
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-open chat when driver outside
  useEffect(() => {
    if (order?.status === 'driver_outside' && !showChat) {
      ensureAndOpenChat();
    }
  }, [order?.status]);

  const handlePaid = async () => {
    if (!supabase || !order) return;
    await supabase.from('orders').update({ paid: true }).eq('order_id', order.order_id);
    showToastMsg('✓ Payment confirmed!', 'success');
  };

  if (orderId === null) return (
    <div style={pageStyle(dark)}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 2s infinite' }}>📦</div>
        <div style={{ color: dark ? '#94a3b8' : '#64748b', fontSize: 16 }}>Loading your order...</div>
      </div>
    </div>
  );

  if (orderId === '') return (
    <div style={pageStyle(dark)}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: '#ef4444', marginBottom: 8, fontSize: 22 }}>Oops!</h2>
        <p style={{ color: dark ? '#94a3b8' : '#64748b', marginBottom: 24 }}>No order ID provided. Please place an order first.</p>
        <Link href="/" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>← Back to Store</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div style={pageStyle(dark)}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 2s infinite' }}>📦</div>
        <div style={{ color: dark ? '#94a3b8' : '#64748b', fontSize: 16 }}>Loading your order...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={pageStyle(dark)}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: '#ef4444', marginBottom: 8, fontSize: 22 }}>Oops!</h2>
        <p style={{ color: dark ? '#94a3b8' : '#64748b', marginBottom: 24 }}>{error}</p>
        <Link href="/" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>← Back to Store</Link>
      </div>
    </div>
  );

  if (!order) return null;

  const currentStep = STATUS_STEPS.find(s => s.id === order.status) || STATUS_STEPS[0];
  const currentIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';
  const history = order.status_history || [];

  // Payment logic
  const isOnlinePayment = ['EFT / PayShap', 'Online Payment', 'Scan to Pay'].includes(order.payment_method);
  const needsOnlinePayment = order.total > 50 && isOnlinePayment && !order.paid;
  const isSmallCashOrder = order.total <= 50 && ['Cash on Delivery', 'Scan to Pay'].includes(order.payment_method);

  return (
    <div style={pageStyle(dark)}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes pop { 0%{transform:scale(.9);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes toastSlide { from{transform:translate(-50%,-150px)} to{transform:translate(-50%,0)} }
        @keyframes drive { 0%{left:8%;top:82%} 14%{left:18%;top:72%} 28%{left:32%;top:58%} 57%{left:52%;top:42%} 71%{left:70%;top:28%} 85%{left:86%;top:16%} 100%{left:86%;top:16%} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .status-icon-anim { animation: pop .4s ease-out, pulse 2s ease-in-out .4s infinite }
        .live-dot { display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;animation:blink 1.4s ease-in-out infinite;vertical-align:middle }
        .map-grid { background-image: linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px);background-size:24px 24px }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: toast.kind === 'success' ? '#10b981' : toast.kind === 'error' ? '#ef4444' : dark ? '#1e293b' : '#1a1a1a',
          color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500,
          zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxWidth: '90%', textAlign: 'center',
          animation: 'toastSlide 0.3s cubic-bezier(0.4,0,0.2,1)'
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 64px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, padding: '14px 0', borderBottom: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#fff' : '#1a1a1a' }}>
              <span>🍕</span> Young Agripreneurs
            </h1>
            <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#6b7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              Order <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{order.order_id}</span>
              <span style={{ background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 999, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                <span className="live-dot" /> Live
              </span>
            </div>
          </div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{ background: dark ? 'rgba(51,65,85,0.6)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
              🏠 Store
            </button>
          </Link>
        </div>

        {/* Status Hero */}
        <div style={{
          textAlign: 'center', padding: '32px 20px',
          background: dark ? 'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(30,41,59,0.8))' : 'linear-gradient(180deg, #ecfdf5, #fff)',
          borderRadius: 20, marginBottom: 16,
          border: dark ? '1px solid rgba(16,185,129,0.15)' : '1px solid #d1fae5',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <div className="status-icon-anim" style={{ fontSize: 64, marginBottom: 12, display: 'inline-block' }}>
            {isDelivered ? '🎉' : isCancelled ? '❌' : currentStep.icon}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: dark ? '#fff' : '#1a1a1a' }}>
            {isDelivered ? 'Delivered!' : isCancelled ? 'Order Cancelled' : currentStep.label}
          </div>
          <div style={{ color: dark ? '#94a3b8' : '#6b7280', fontSize: 14 }}>
            {isDelivered ? 'Enjoy your meal!' : isCancelled ? 'This order has been cancelled' : currentStep.description}
          </div>
          {!isDelivered && !isCancelled && (
            <div style={{
              marginTop: 14, padding: '8px 16px', background: dark ? 'rgba(30,41,59,0.8)' : '#fff',
              color: '#10b981', borderRadius: 999, display: 'inline-block', fontWeight: 700, fontSize: 13,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              {currentStep.eta > 0 ? `ETA: ${currentStep.eta} mins` : 'Arrived!'}
            </div>
          )}
        </div>

        {/* Delivered Banner */}
        {isDelivered && (
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)', border: '1px solid #6ee7b7',
            color: '#065f46', padding: 16, borderRadius: 12, textAlign: 'center', fontWeight: 600,
            marginBottom: 16, fontSize: 15
          }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 6 }}>🎉</span>
            Enjoy your meal! Thanks for ordering with Young Agripreneurs.
          </div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && (
          <div style={{
            background: '#7f1d1d', padding: 16, borderRadius: 12, textAlign: 'center', marginBottom: 16
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#fca5a5' }}>This order has been cancelled</p>
          </div>
        )}

        {/* Map */}
        {!isDelivered && !isCancelled && (
          <div style={{
            height: 180, background: dark ? 'linear-gradient(135deg, #0f172a, #1e293b)' : 'linear-gradient(135deg, #e0f2fe, #fef3c7)',
            borderRadius: 16, position: 'relative', overflow: 'hidden', marginBottom: 16,
            border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb'
          }} className="map-grid">
            {/* Route line */}
            <div style={{
              position: 'absolute', left: '15%', right: '15%', top: '60%', height: 3,
              background: 'repeating-linear-gradient(90deg, #10b981 0 8px, transparent 8px 14px)', opacity: 0.5, borderRadius: 2
            }} />
            {/* Store */}
            <div style={{ position: 'absolute', left: 18, top: 18, fontSize: 28, zIndex: 1 }}>🏪</div>
            <div style={{ position: 'absolute', left: 50, top: 14, background: dark ? 'rgba(30,41,59,0.9)' : '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', color: dark ? '#fff' : '#1a1a1a' }}>Store</div>
            {/* Home */}
            <div style={{ position: 'absolute', right: 18, bottom: 18, fontSize: 28, zIndex: 1 }}>🏠</div>
            <div style={{ position: 'absolute', right: 56, bottom: 14, background: dark ? 'rgba(30,41,59,0.9)' : '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', color: dark ? '#fff' : '#1a1a1a' }}>Home</div>
            {/* Moving Vehicle */}
            <div style={{
              position: 'absolute',
              left: currentStep.mapPos.left,
              top: currentStep.mapPos.top,
              width: 40, height: 40, background: '#10b981', borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg) translate(-50%, -50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)', zIndex: 2,
              transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>🚚</span>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {needsOnlinePayment && (
          <div style={{
            background: dark ? 'linear-gradient(135deg, #1e3a5f, #0f172a)' : 'linear-gradient(135deg, #eff6ff, #fff)',
            padding: 20, borderRadius: 16, marginBottom: 16,
            border: dark ? '1px solid rgba(59,130,246,0.3)' : '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>💳</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#1a1a1a' }}>Payment Required</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: dark ? '#94a3b8' : '#6b7280' }}>
              Your order total is <strong style={{ color: '#10b981' }}>R{order.total}</strong>. Please complete payment to process your order.
            </p>

            <div style={{ background: dark ? '#111827' : '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: dark ? '#fff' : '#1a1a1a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏦</span> Bank Transfer
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>Bank</span>
                  <span style={{ color: dark ? '#fff' : '#1a1a1a', fontWeight: 600 }}>{BANK_DETAILS.bank}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>Account Name</span>
                  <span style={{ color: dark ? '#fff' : '#1a1a1a', fontWeight: 600 }}>{BANK_DETAILS.accountName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>Account Number</span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>{BANK_DETAILS.accountNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>Branch Code</span>
                  <span style={{ color: dark ? '#fff' : '#1a1a1a', fontWeight: 600, fontFamily: 'monospace' }}>{BANK_DETAILS.branchCode}</span>
                </div>
              </div>
            </div>

            <div style={{ background: dark ? '#111827' : '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: dark ? '#fff' : '#1a1a1a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📱</span> PayShap / Cellphone Pay
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>PayShap Number</span>
                  <span style={{ color: '#8b5cf6', fontWeight: 700, fontFamily: 'monospace' }}>{BANK_DETAILS.payshapNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>Capitec Cell Pay</span>
                  <span style={{ color: '#8b5cf6', fontWeight: 700, fontFamily: 'monospace' }}>{BANK_DETAILS.capitecCell}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fef3c7', padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                ⚠️ Use reference: <strong>{order.order_id}</strong> when making payment
              </p>
            </div>

            <button onClick={handlePaid} style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <span>✓</span> I've Paid — Confirm Payment
            </button>
          </div>
        )}

        {order.paid && (
          <div style={{
            background: 'rgba(16,185,129,0.15)', padding: 16, borderRadius: 12, marginBottom: 16,
            border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 22 }}>✓</span>
            <div>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>Payment Confirmed</div>
              <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#6b7280', marginTop: 2 }}>Your order is being processed</div>
            </div>
          </div>
        )}

        {isSmallCashOrder && (
          <div style={{
            background: 'rgba(245,158,11,0.15)', padding: 16, borderRadius: 12, marginBottom: 16,
            border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 22 }}>💵</span>
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 14 }}>Cash on Delivery</div>
              <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#6b7280', marginTop: 2 }}>Please pay R{order.total} to the driver on arrival</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          background: dark ? 'rgba(30,41,59,0.6)' : '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#1a1a1a' }}>Order Status</h3>
          <div style={{ position: 'relative', paddingLeft: 30 }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 11, top: 14, bottom: 14, width: 2,
              background: dark ? 'rgba(51,65,85,0.5)' : '#e5e7eb'
            }} />
            {STATUS_STEPS.map((step, i) => {
              const historyItem = history.find(h => h.status === step.id);
              const isCompleted = !!historyItem || i < currentIndex;
              const isCurrent = order.status === step.id && !isDelivered;
              const isFuture = i > currentIndex && !isDelivered;
              const timeStr = historyItem ? new Date(historyItem.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div key={step.id} style={{ position: 'relative', padding: '10px 0', opacity: isCompleted || isCurrent ? 1 : 0.35 }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: -25, top: 14, width: 14, height: 14, borderRadius: '50%',
                    background: isCompleted ? '#10b981' : (isCurrent ? '#10b981' : dark ? '#334155' : '#fff'),
                    border: isCurrent ? '3px solid #10b981' : `2px solid ${isCompleted ? '#10b981' : (dark ? 'rgba(51,65,85,0.5)' : '#e5e7eb')}`,
                    boxShadow: isCurrent ? '0 0 0 4px rgba(16,185,129,0.2)' : 'none',
                    transition: 'all 0.3s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isCompleted && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div style={{ fontWeight: isCurrent ? 700 : 500, fontSize: 14, color: isCurrent ? '#10b981' : (dark ? '#fff' : '#1a1a1a'), display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{step.icon}</span> {step.label}
                  </div>
                  {timeStr && (
                    <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#6b7280', marginTop: 2, marginLeft: 24 }}>{timeStr}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div style={{
          background: dark ? 'rgba(30,41,59,0.6)' : '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#1a1a1a' }}>Order Details</h3>

          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, gap: 12, borderBottom: dark ? '1px solid rgba(51,65,85,0.2)' : '1px dashed #e5e7eb' }}>
              <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>
                <span style={{ color: dark ? '#94a3b8' : '#6b7280', marginRight: 6 }}>{item.qty}×</span>
                {item.title}
                {(item.freeQty || 0) > 0 && (
                  <span style={{ color: '#6366f1', fontWeight: 700, marginLeft: 6, fontSize: 12 }}>🤖 +{item.freeQty} FREE</span>
                )}
              </span>
              <span style={{ fontWeight: 600, color: dark ? '#fff' : '#1a1a1a' }}>R{(item.price * (item.qty - (item.freeQty || 0))).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: dark ? '#94a3b8' : '#6b7280' }}>
            <span>Subtotal</span>
            <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>R{order.subtotal}</span>
          </div>
          {(order.bulk_discount || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14, color: '#6366f1' }}>
              <span>🤖 Bulk Discount (10%)</span>
              <span style={{ fontWeight: 700 }}>-R{order.bulk_discount}</span>
            </div>
          )}
          {(order.delivery_fee || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14, color: dark ? '#94a3b8' : '#6b7280' }}>
              <span>🚚 Delivery Fee</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>R{order.delivery_fee}</span>
            </div>
          )}
          {(order.tip || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14, color: dark ? '#94a3b8' : '#6b7280' }}>
              <span>💚 Tip</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>R{order.tip}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 16, fontWeight: 700, borderTop: dark ? '1px solid rgba(51,65,85,0.3)' : '1px dashed #e5e7eb', marginTop: 8 }}>
            <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>Total</span>
            <span style={{ color: '#10b981' }}>R{order.total}</span>
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: dark ? '1px solid rgba(51,65,85,0.2)' : '1px solid #e5e7eb', fontSize: 13, color: dark ? '#94a3b8' : '#6b7280' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Payment</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>{order.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Communication</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>{order.communication_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Driver</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a' }}>{order.driver_name || 'Assigning...'}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={{
          background: dark ? 'rgba(30,41,59,0.6)' : '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#1a1a1a' }}>Delivery Address</h3>
          <div style={{ fontSize: 14, color: dark ? '#fff' : '#1a1a1a', fontWeight: 600, marginBottom: 2 }}>{order.customer_name}</div>
          <div style={{ fontSize: 13, color: dark ? '#94a3b8' : '#6b7280' }}>{order.address}</div>
          {order.location && (
            <div style={{ fontSize: 12, color: '#10b981', marginTop: 6, fontWeight: 600 }}>
              📍 {order.location === 'upper' ? 'Upper Campus' : 'Lower Campus'}
            </div>
          )}
        </div>

        <Link href="/" style={{
          display: 'block', textAlign: 'center', color: '#10b981', textDecoration: 'none',
          padding: 14, borderRadius: 14, border: '1px solid #10b981', fontWeight: 700, fontSize: 15
        }}>
          ← Back to Store
        </Link>
      </div>

      {/* Chat FAB */}
      {!showChat && (
        <button onClick={ensureAndOpenChat} style={{
          position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%',
          border: 'none', background: '#2563eb', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)', zIndex: 50, fontSize: 24
        }}>
          💬
        </button>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
          }} onClick={() => setShowChat(false)} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 500, height: '70vh',
            background: dark ? '#1f2937' : '#fff', borderRadius: 24,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: dark ? '#111827' : '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: dark ? '#fff' : '#1a1a1a' }}>Support Chat</h3>
                <p style={{ margin: 0, fontSize: 12, color: dark ? '#94a3b8' : '#6b7280' }}>Order #{order.order_id}</p>
              </div>
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: dark ? '#94a3b8' : '#6b7280', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map(msg => {
                const isAdmin = msg.sender_role === 'admin';
                const isSystem = msg.message_type === 'system';
                if (isSystem) return (
                  <div key={msg.id} style={{ textAlign: 'center', margin: '8px 0' }}>
                    <span style={{ background: dark ? '#374151' : '#f1f5f9', color: dark ? '#d1d5db' : '#6b7280', padding: '6px 14px', borderRadius: 20, fontSize: 12 }}>{msg.content}</span>
                  </div>
                );
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                    <div style={{
                      background: isAdmin ? (dark ? '#374151' : '#f1f5f9') : 'linear-gradient(135deg, #10b981, #059669)',
                      color: isAdmin ? (dark ? '#fff' : '#1a1a1a') : '#fff',
                      padding: '10px 16px', borderRadius: isAdmin ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      fontSize: 14, lineHeight: 1.4
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: dark ? '#94a3b8' : '#6b7280' }}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isAdmin && <span>✓✓</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={{
              background: dark ? '#111827' : '#f8fafc',
              borderTop: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb',
              padding: 16, display: 'flex', gap: 12
            }}>
              <input
                type="text" placeholder="Type a message..."
                value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCustomerMessage()}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 24,
                  border: dark ? '1px solid rgba(71,85,105,0.5)' : '1px solid #e5e7eb',
                  background: dark ? '#1f2937' : '#fff', color: dark ? '#fff' : '#1a1a1a',
                  fontSize: 14, outline: 'none'
                }}
              />
              <button onClick={sendCustomerMessage} disabled={!newMessage.trim()} style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: newMessage.trim() ? '#10b981' : dark ? '#374151' : '#e5e7eb',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
              }}>
                <span style={{ fontSize: 18 }}>➤</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function pageStyle(dark) {
  return {
    minHeight: '100vh',
    background: dark ? '#0f172a' : '#f6f7fb',
    color: dark ? '#fff' : '#1a1a1a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased'
  };
}
