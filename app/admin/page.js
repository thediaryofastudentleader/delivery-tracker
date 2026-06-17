'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import {
  Shield, Plus, RefreshCw, Truck, MapPin, Clock, Package,
  CheckCircle2, Phone, ChevronRight, LogOut, Loader2,
  ToggleLeft, ToggleRight, Flame, Percent, Timer,
  Star, X, Check, MessageCircle, Send, CheckCheck,
  ShoppingBag, Settings, BarChart3, Eye, DollarSign, Gem
} from 'lucide-react';
import { getSupabase } from '@/lib/supabaseClient';

const STATUS_OPTIONS = [
  { value: 'order_received', label: 'Order Received', icon: Package, color: '#3b82f6', bg: '#dbeafe' },
  { value: 'preparing', label: 'Preparing', icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: '#10b981', bg: '#d1fae5' },
  { value: '10_mins_away', label: '10 Minutes Away', icon: Clock, color: '#ec4899', bg: '#fce7f3' },
  { value: '5_mins_away', label: '5 Minutes Away', icon: Clock, color: '#f97316', bg: '#ffedd5' },
  { value: 'driver_outside', label: 'Driver is Outside', icon: MapPin, color: '#22c55e', bg: '#dcfce7' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2, color: '#6366f1', bg: '#e0e7ff' },
  { value: 'cancelled', label: 'Cancelled', icon: LogOut, color: '#ef4444', bg: '#fee2e2' },
];

const ALL_PRODUCTS = [
  { id: 'p1', name: 'Toppers (125g)', stock: 20 },
  { id: 'p2', name: 'Stumbo Lollipop', stock: 100 },
  { id: 'p3', name: 'Simba (120g)', stock: 15 },
  { id: 'p4', name: 'Noodles (70g)', stock: 50 },
  { id: 'p5', name: 'Cadbury Lunchbar', stock: 30 },
  { id: 'p6', name: 'Energy Drink', stock: 25 },
];

export default function AdminPage() {
  const supabase = getSupabase();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [onCampus, setOnCampus] = useState(true);
  const [hotSale, setHotSale] = useState({ active: false, discount: 10, duration: 6, selectedProducts: [] });
  const [saleTimeLeft, setSaleTimeLeft] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [stock, setStock] = useState({});

  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 💎 CPC & Points states
  const [cpcList, setCpcList] = useState([]);
  const [loadingCPC, setLoadingCPC] = useState(false);
  const [selectedCPC, setSelectedCPC] = useState(null);
  const [cpcPoints, setCpcPoints] = useState(null);
  const [cashChangeOrder, setCashChangeOrder] = useState(null);
  const [cashChangeAmount, setCashChangeAmount] = useState(0);
  const [cashChangeStored, setCashChangeStored] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('admin_auth') === 'true') setIsAuthenticated(true);
    setOnCampus(localStorage.getItem('vc_campus_status') !== 'false');
    const savedStock = JSON.parse(localStorage.getItem('vc_stock') || '{}');
    const initialStock = {};
    ALL_PRODUCTS.forEach(p => { initialStock[p.id] = savedStock[p.id] ?? p.stock; });
    setStock(initialStock);
    const savedSale = localStorage.getItem('vc_hot_sale');
    if (savedSale) {
      try {
        const parsed = JSON.parse(savedSale);
        if (parsed.active && new Date(parsed.endTime) > new Date()) setHotSale(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('vc_campus_status', onCampus.toString());
  }, [onCampus, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('vc_stock', JSON.stringify(stock));
  }, [stock, mounted]);

  useEffect(() => {
    if (!hotSale?.active || !hotSale?.endTime) { setSaleTimeLeft(''); return; }
    const timer = setInterval(() => {
      const diff = new Date(hotSale.endTime) - new Date();
      if (diff <= 0) { setHotSale(prev => ({ ...prev, active: false })); localStorage.removeItem('vc_hot_sale'); setSaleTimeLeft(''); return; }
      setSaleTimeLeft(`${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [hotSale]);

  const fetchOrders = async () => {
    if (!supabase) { console.warn('Supabase client not available'); return; }
    setLoadingOrders(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoadingOrders(false);
  };

  const fetchCPCs = async () => {
    if (!supabase) return;
    setLoadingCPC(true);
    const { data } = await supabase.from('cash_pass_codes').select('*').order('created_at', { ascending: false });
    if (data) setCpcList(data);
    setLoadingCPC(false);
  };

  const viewCPCPoints = async (cpc) => {
    if (!supabase) return;
    setSelectedCPC(cpc);
    const { data } = await supabase.from('customer_points').select('*').eq('cpc_code', cpc.code).single();
    setCpcPoints(data || null);
  };

  useEffect(() => {
    if (!isAuthenticated || !mounted) return;
    fetchOrders();
    if (!supabase) return;
    const subscription = supabase.channel('orders-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(); }).subscribe();
    return () => { subscription.unsubscribe(); };
  }, [isAuthenticated, mounted]);

  const openChat = async (order) => {
    if (!supabase) { alert('Live chat unavailable: missing Supabase configuration'); return; }
    setActiveChatOrder(order);
    setChatLoading(true);
    await supabase.rpc('mark_order_chat_as_read', { p_order_id: order.order_id });
    setOrders(prev => prev.map(o => o.order_id === order.order_id ? { ...o, has_new_chat: false } : o));

    let { data: conv } = await supabase.from('chat_conversations').select('*').eq('order_id', order.order_id).single();
    if (!conv) {
      const { data: newConv } = await supabase.from('chat_conversations').insert({ order_id: order.order_id, title: `Order ${order.order_id}` }).select().single();
      conv = newConv;
    }
    const { data: msgs } = await supabase.from('chat_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
    setChatMessages(msgs || []);
    setChatLoading(false);

    const channel = supabase.channel(`chat-${conv.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conv.id}` }, payload => {
      setChatMessages(prev => [...prev, payload.new]);
    }).subscribe();
    return () => channel.unsubscribe();
  };

  const closeChat = () => {
    setActiveChatOrder(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !activeChatOrder) return;
    if (!supabase) { alert('Live chat unavailable'); return; }
    const { data: conv } = await supabase.from('chat_conversations').select('id').eq('order_id', activeChatOrder.order_id).single();
    if (!conv) return;
    await supabase.from('chat_messages').insert({
      conversation_id: conv.id,
      order_id: activeChatOrder.order_id,
      sender_name: 'Admin',
      sender_role: 'admin',
      message_type: 'text',
      content: newMessage
    });
    setNewMessage('');
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'MySecretAdmin10') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else { alert('Incorrect password'); }
  };

  const updateStatus = async (orderId, newStatus) => {
    if (!supabase) { alert('Status update unavailable'); return; }
    const { data: existing } = await supabase.from('orders').select('status_history').eq('order_id', orderId).single();
    const newHistory = [...(existing?.status_history || []), { status: newStatus, time: new Date().toISOString() }];
    await supabase.from('orders').update({ status: newStatus, status_history: newHistory, updated_at: new Date().toISOString() }).eq('order_id', orderId);
    if (newStatus === 'driver_outside') {
      const { data: conv } = await supabase.from('chat_conversations').select('id').eq('order_id', orderId).single();
      if (conv) {
        await supabase.from('chat_messages').insert({
          conversation_id: conv.id, order_id: orderId, sender_name: 'System', sender_role: 'admin',
          message_type: 'system', content: '🚪 Your driver is outside! Please come collect your order.'
        });
      }
    }
    fetchOrders();
  };

  // 💎 APPROVE PAYMENT
  const approvePayment = async (orderId) => {
    if (!supabase) return;
    await supabase.from('orders').update({ paid: true, payment_status: 'approved' }).eq('order_id', orderId);
    await supabase.from('proof_of_payments').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('order_id', orderId);
    fetchOrders();
  };

  // 💎 RECORD CASH CHANGE
  const recordCashChange = async () => {
    if (!cashChangeOrder || !supabase) return;
    const pointsValue = cashChangeAmount >= 20 ? 1200 : cashChangeAmount >= 10 ? 600 : cashChangeAmount >= 5 ? 300 : 0;
    await supabase.from('orders').update({
      cash_change_given: true,
      cash_change_stored: cashChangeStored,
      cash_change_amount: cashChangeAmount
    }).eq('order_id', cashChangeOrder.order_id);
    if (cashChangeStored && cashChangeOrder.cash_pass_code && pointsValue > 0) {
      const { data: pointsRow } = await supabase.from('customer_points').select('*').eq('cpc_code', cashChangeOrder.cash_pass_code).single();
      if (pointsRow) {
        await supabase.from('customer_points').update({
          points_balance: pointsRow.points_balance + pointsValue,
          total_earned: pointsRow.total_earned + pointsValue,
          last_purchase_date: new Date().toISOString()
        }).eq('cpc_code', cashChangeOrder.cash_pass_code);
        await supabase.from('points_transactions').insert({
          cpc_code: cashChangeOrder.cash_pass_code,
          order_id: cashChangeOrder.order_id,
          points: pointsValue,
          type: 'cash_change',
          description: `Cash change of R${cashChangeAmount} stored as points`,
          rands_equivalent: cashChangeAmount
        });
      }
    }
    setCashChangeOrder(null);
    setCashChangeAmount(0);
    setCashChangeStored(false);
    fetchOrders();
  };

  const toggleHotSale = () => {
    if (hotSale.active) {
      setHotSale({ ...hotSale, active: false });
      localStorage.removeItem('vc_hot_sale');
    } else {
      const endTime = new Date(Date.now() + (hotSale.duration || 6) * 3600000).toISOString();
      const newSale = { ...hotSale, active: true, endTime, startTime: new Date().toISOString() };
      setHotSale(newSale);
      localStorage.setItem('vc_hot_sale', JSON.stringify(newSale));
    }
  };

  const updateStock = (id, delta) => {
    setStock(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  };

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>Loading...</div>;
  if (!isAuthenticated) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff' }}>
      <div style={{ background: '#1f2937', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: 400 }}>
        <Shield size={48} style={{ color: '#22c55e', marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 24, margin: '0 0 24px 0', textAlign: 'center' }}>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #374151', background: '#0f172a', color: '#fff', marginBottom: 12 }} />
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#22c55e', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}><Shield size={28} color="#22c55e" /> Admin Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#9ca3af', fontSize: 14 }}>Campus: {onCampus ? 'Open' : 'Closed'}</span>
            <button onClick={() => setOnCampus(!onCampus)} style={{ background: onCampus ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{onCampus ? 'Open' : 'Closed'}</button>
            <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('admin_auth'); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><LogOut size={16} /> Logout</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #374151', paddingBottom: 12, overflowX: 'auto' }}>
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'stock', label: 'Stock', icon: Package },
            { id: 'sale', label: 'Hot Sale', icon: Flame },
            { id: 'cpc', label: 'CPC & Points', icon: Gem }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'cpc') fetchCPCs(); }} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: activeTab === tab.id ? '#22c55e' : '#1f2937', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Orders ({orders.length})</h2>
              <button onClick={fetchOrders} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><RefreshCw size={16} /> Refresh</button>
            </div>
            {loadingOrders ? <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /></div> :
             orders.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No orders yet.</div> :
             orders.map(order => (
               <OrderCard
                 key={order.id}
                 order={order}
                 onUpdateStatus={updateStatus}
                 onOpenChat={openChat}
                 onApprovePayment={approvePayment}
                 onCashChange={(o) => { setCashChangeOrder(o); setCashChangeAmount(0); setCashChangeStored(false); }}
               />
             ))}
          </div>
        )}

        {activeTab === 'stock' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0' }}>Stock Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {ALL_PRODUCTS.map(p => (
                <div key={p.id} style={{ background: '#1f2937', padding: '20px', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{stock[p.id] ?? p.stock}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>units in stock</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => updateStock(p.id, -1)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#374151', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>-</button>
                    <button onClick={() => updateStock(p.id, 1)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sale' && (
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Hot Sale Manager</h2>
            <div style={{ background: '#1f2937', padding: '24px', borderRadius: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 600 }}>Status</span>
                <span style={{ color: hotSale.active ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{hotSale.active ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
              {hotSale.active && saleTimeLeft && (
                <div style={{ background: '#0f172a', padding: 12, borderRadius: 12, textAlign: 'center', marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>⏰ {saleTimeLeft}</div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Discount %</label>
                <input type="number" value={hotSale.discount} onChange={(e) => setHotSale({ ...hotSale, discount: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #374151', background: '#0f172a', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Duration (hours)</label>
                <input type="number" value={hotSale.duration} onChange={(e) => setHotSale({ ...hotSale, duration: parseInt(e.target.value) || 1 })} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #374151', background: '#0f172a', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Target Products (leave empty for all)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_PRODUCTS.map(p => (
                    <button key={p.id} onClick={() => {
                      const selected = hotSale.selectedProducts || [];
                      setHotSale({ ...hotSale, selectedProducts: selected.includes(p.id) ? selected.filter(x => x !== p.id) : [...selected, p.id] });
                    }} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: (hotSale.selectedProducts || []).includes(p.id) ? '#22c55e' : '#374151', color: '#fff', cursor: 'pointer', fontSize: 12 }}>{p.name}</button>
                  ))}
                </div>
              </div>
              <button onClick={toggleHotSale} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: hotSale.active ? '#ef4444' : '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {hotSale.active ? 'End Hot Sale' : 'Start Hot Sale'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'cpc' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>CPC & Points ({cpcList.length})</h2>
              <button onClick={fetchCPCs} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><RefreshCw size={16} /> Refresh</button>
            </div>
            {loadingCPC ? <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /></div> :
             cpcList.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No CPCs yet.</div> :
             (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                 {cpcList.map(cpc => (
                   <div key={cpc.id} style={{ background: '#1f2937', borderRadius: 16, padding: 20, cursor: 'pointer' }} onClick={() => viewCPCPoints(cpc)}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                       <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{cpc.code}</div>
                       <div style={{ background: '#374151', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Cat {cpc.category}</div>
                     </div>
                     <div style={{ fontSize: 14, marginBottom: 4 }}>{cpc.customer_name}</div>
                     <div style={{ fontSize: 12, color: '#9ca3af' }}>{cpc.phone} • {cpc.total_orders} orders</div>
                   </div>
                 ))}
               </div>
             )}
            {selectedCPC && (
              <div style={{ marginTop: 24, background: '#1f2937', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>CPC Details: {selectedCPC.code}</h3>
                  <button onClick={() => setSelectedCPC(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, marginBottom: 16 }}>
                  <div><span style={{ color: '#9ca3af' }}>Name:</span> {selectedCPC.customer_name}</div>
                  <div><span style={{ color: '#9ca3af' }}>Category:</span> {selectedCPC.category}</div>
                  <div><span style={{ color: '#9ca3af' }}>Phone:</span> {selectedCPC.phone}</div>
                  <div><span style={{ color: '#9ca3af' }}>Orders:</span> {selectedCPC.total_orders}</div>
                </div>
                {cpcPoints && (
                  <div style={{ background: '#0f172a', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#9ca3af' }}>Points Balance</span>
                      <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>{cpcPoints.points_balance}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
                      <span>Total Earned: {cpcPoints.total_earned}</span>
                      <span>Total Redeemed: {cpcPoints.total_redeemed}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#f59e0b' }}>
                      Rands Value: R{Math.floor((cpcPoints.points_balance || 0) / 300) * 5}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {activeChatOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={closeChat} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 500, height: '80vh', background: '#1f2937', borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Chat: {activeChatOrder.customer_name}</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Order #{activeChatOrder.order_id}</p>
              </div>
              <button onClick={closeChat} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatLoading ? <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 40 }}>Loading messages...</div> :
               chatMessages.map(msg => {
                 const isAdmin = msg.sender_role === 'admin';
                 const isSystem = msg.message_type === 'system';
                 if (isSystem) return (
                   <div key={msg.id} style={{ textAlign: 'center', margin: '8px 0' }}>
                     <span style={{ background: '#374151', color: '#d1d5db', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{msg.content}</span>
                   </div>
                 );
                 return (
                   <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                     <div style={{ background: isAdmin ? 'linear-gradient(135deg, #10b981, #059669)' : '#374151', color: '#fff', padding: '10px 16px', borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.4, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                       {msg.content}
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: '#9ca3af' }}>
                       <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {isAdmin && <CheckCheck size={14} color={msg.is_read ? '#10b981' : '#9ca3af'} />}
                     </div>
                   </div>
                 );
               })}
              <div ref={chatEndRef} />
            </div>
            <div style={{ background: '#111827', borderTop: '1px solid #374151', padding: 16, display: 'flex', gap: 12 }}>
              <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()} style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid #4b5563', background: '#1f2937', color: '#fff', fontSize: 14, outline: 'none' }} />
              <button onClick={sendAdminMessage} disabled={!newMessage.trim()} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: newMessage.trim() ? '#10b981' : '#374151', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Change Modal */}
      {cashChangeOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ background: '#1f2937', borderRadius: 24, padding: 24, maxWidth: 400, width: '100%' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>💰 Cash Change</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>Order #{cashChangeOrder.order_id}</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Change Amount (R)</label>
              <input
                type="number"
                value={cashChangeAmount}
                onChange={(e) => setCashChangeAmount(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #374151', background: '#0f172a', color: '#fff' }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={cashChangeStored} onChange={(e) => setCashChangeStored(e.target.checked)} style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 14 }}>Store change in CPC as points</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCashChangeOrder(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #374151', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={recordCashChange} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, onOpenChat, onApprovePayment, onCashChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentStatusInfo = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];
  const StatusIcon = currentStatusInfo.icon;

  return (
    <div style={{ background: '#1f2937', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: order.has_new_chat ? '1px solid #10b981' : '1px solid transparent', transition: 'all 0.15s' }}>
      <div onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {order.has_new_chat && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', flexShrink: 0 }} />}
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>#{order.order_id}</div>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>{order.customer_name} • {order.phone}</div>
          </div>
        </div>
        <span style={{ background: currentStatusInfo.bg, color: currentStatusInfo.color, padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <StatusIcon size={14} /> {currentStatusInfo.label}
        </span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={() => onOpenChat(order)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MessageCircle size={18} /> {order.has_new_chat ? 'Reply to New Message' : 'Open Chat'}
            </button>
          </div>

          {/* 💎 Payment & Proof of Payment */}
          <div style={{ background: '#111827', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Payment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 12 }}>
              <div><span style={{ color: '#9ca3af' }}>Method:</span> {order.payment_method}</div>
              <div><span style={{ color: '#9ca3af' }}>Status:</span> <span style={{ color: order.paid ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{order.paid ? 'Paid' : order.payment_status}</span></div>
              <div><span style={{ color: '#9ca3af' }}>Total:</span> <strong>R{order.total}</strong></div>
              {order.cash_pass_code && <div><span style={{ color: '#9ca3af' }}>CPC:</span> <span style={{ color: '#3b82f6' }}>{order.cash_pass_code}</span></div>}
            </div>
            {order.proof_of_payment_url && (
              <div style={{ marginBottom: 12 }}>
                <a href={order.proof_of_payment_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={16} /> View Proof of Payment
                </a>
                {order.payment_status === 'proof_uploaded' && (
                  <button onClick={() => onApprovePayment(order.order_id)} style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ✓ Approve Payment
                  </button>
                )}
              </div>
            )}
            {order.cash_change_given && (
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
                💰 Change: R{order.cash_change_amount} {order.cash_change_stored ? '(stored in CPC)' : '(given to customer)'}
              </div>
            )}
            <button onClick={() => onCashChange(order)} style={{ marginTop: 8, padding: '8px 14px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <DollarSign size={14} /> Record Cash Change
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Update Status</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STATUS_OPTIONS.map(opt => {
                const OptIcon = opt.icon;
                const isCurrent = order.status === opt.value;
                return (
                  <button key={opt.value} onClick={() => onUpdateStatus(order.order_id, opt.value)} disabled={isCurrent} style={{ padding: '8px 14px', background: isCurrent ? opt.color : '#374151', color: '#fff', borderRadius: 12, border: 'none', cursor: isCurrent ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: isCurrent ? 1 : 0.8 }}>
                    <OptIcon size={14} /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#111827', padding: 16, borderRadius: 12, fontSize: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><span style={{ color: '#9ca3af' }}>Comm:</span> {order.communication_method}</div>
              <div><span style={{ color: '#9ca3af' }}>Address:</span> {order.address}</div>
              <div><span style={{ color: '#9ca3af' }}>Location:</span> {order.location}</div>
              <div><span style={{ color: '#9ca3af' }}>Driver:</span> {order.driver_name || 'Assigning...'}</div>
            </div>
            {order.notes && <div style={{ marginTop: 8, color: '#9ca3af' }}>Notes: {order.notes}</div>}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Items:</div>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1f2937' }}>
                  <span>{item.title}</span><span>x{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
