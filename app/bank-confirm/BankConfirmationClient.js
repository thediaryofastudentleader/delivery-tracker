'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const BANK_DETAILS = {
  bank: 'Capitec / African bank',
  accountName: 'Young Agripreneurs',
  accountNumber: '2081845985',
  branchCode: '470010',
  payshapNumber: '0631917709@AFRICANBANK',
  capitecCell: '0631917709',
};

export default function BankConfirmationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cpcCode, setCpcCode] = useState('');
  const [cpcValid, setCpcValid] = useState(false);
  const [previousQualified, setPreviousQualified] = useState(false);
  const [dark, setDark] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId || !supabase) return;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();
    if (error || !data) {
      setError('Order not found');
      setLoading(false);
      return;
    }
    if (data.total <= 50) {
      router.push(`/tracker?order=${orderId}`);
      return;
    }
    if (data.paid || data.payment_status === 'approved') {
      router.push(`/tracker?order=${orderId}`);
      return;
    }
    setOrder(data);
    if (data.phone) {
      const { data: prev } = await supabase
        .from('orders')
        .select('total')
        .eq('phone', data.phone)
        .gt('total', 50)
        .limit(1);
      if (prev && prev.length > 0) setPreviousQualified(true);
    }
    setLoading(false);
  }, [orderId, router]);

  useEffect(() => {
    const savedDark = localStorage.getItem('vc_dark_mode') === 'true';
    setDark(savedDark);
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }
    setFile(f);
  };

  const uploadProof = async () => {
    if (!file || !order || !supabase) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const { error } = await supabase.from('proof_of_payments').upsert({
          order_id: order.order_id,
          file_url: base64,
          status: 'pending',
        });
        if (error) throw error;
        await supabase
          .from('orders')
          .update({ payment_status: 'proof_uploaded' })
          .eq('order_id', order.order_id);
        setOrder((prev) => ({ ...prev, payment_status: 'proof_uploaded' }));
        alert('Proof uploaded! Waiting for seller approval.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const validateCPC = async () => {
    if (!cpcCode || !supabase) return;
    const { data } = await supabase
      .from('cash_pass_codes')
      .select('*')
      .eq('code', cpcCode.toLowerCase())
      .single();
    if (data && data.is_active) {
      setCpcValid(true);
      localStorage.setItem('vc_cpc', cpcCode);
    } else {
      alert('Invalid Cash Pass Code');
      setCpcValid(false);
    }
  };

  const handlePayDriver = async () => {
    if (!order) return;
    if (!cpcValid && !previousQualified) {
      alert('You need a valid Cash Pass Code or a previous purchase over R50 to pay the driver.');
      return;
    }
    await supabase
      .from('orders')
      .update({
        payment_status: 'pay_driver',
        notes:
          (order.notes || '') +
          ' | Customer will pay driver with cash.',
      })
      .eq('order_id', order.order_id);
    router.push(`/tracker?order=${order.order_id}`);
  };

  if (loading)
    return (
      <div style={pageStyle(dark)}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, animation: 'pulse 2s infinite' }}>🏦</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div style={pageStyle(dark)}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2 style={{ color: '#ef4444' }}>{error}</h2>
          <Link href="/" style={{ color: '#10b981' }}>
            ← Back
          </Link>
        </div>
      </div>
    );
  if (!order) return null;

  return (
    <div style={pageStyle(dark)}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 64px' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
          <h1 style={{ margin: 0, fontSize: 22, color: dark ? '#fff' : '#1a1a1a' }}>
            Payment Confirmation
          </h1>
          <p style={{ color: dark ? '#94a3b8' : '#64748b', marginTop: 8 }}>
            Order #{order.order_id}
          </p>
        </div>

        <div
          style={{
            background: dark ? 'rgba(30,41,59,0.6)' : '#fff',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15, color: dark ? '#fff' : '#1a1a1a' }}>
            Bank Details
          </h3>
          <div style={{ display: 'grid', gap: 10, fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bank</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a', fontWeight: 600 }}>
                {BANK_DETAILS.bank}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Account Name</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a', fontWeight: 600 }}>
                {BANK_DETAILS.accountName}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Account Number</span>
              <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>
                {BANK_DETAILS.accountNumber}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Branch Code</span>
              <span style={{ color: dark ? '#fff' : '#1a1a1a', fontWeight: 600, fontFamily: 'monospace' }}>
                {BANK_DETAILS.branchCode}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>PayShap</span>
              <span style={{ color: '#8b5cf6', fontWeight: 700, fontFamily: 'monospace' }}>
                {BANK_DETAILS.payshapNumber}
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 8,
              background: '#fef3c7',
              color: '#92400e',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ⚠️ Use reference: <strong>{order.order_id}</strong>
          </div>
        </div>

        <div
          style={{
            background: dark ? 'rgba(30,41,59,0.6)' : '#fff',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15, color: dark ? '#fff' : '#1a1a1a' }}>
            Upload Proof of Payment
          </h3>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            style={{ marginBottom: 12, color: dark ? '#fff' : '#1a1a1a' }}
          />
          {file && (
            <button
              onClick={uploadProof}
              disabled={uploading}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 14,
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Proof →'}
            </button>
          )}
          {order.payment_status === 'proof_uploaded' && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ⏳ Proof uploaded. Waiting for seller approval...
            </div>
          )}
        </div>

        <div
          style={{
            background: dark ? 'rgba(30,41,59,0.6)' : '#fff',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            border: dark ? '1px solid rgba(51,65,85,0.3)' : '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15, color: dark ? '#fff' : '#1a1a1a' }}>
            Or Pay Driver on Delivery
          </h3>
          <p style={{ fontSize: 13, color: dark ? '#94a3b8' : '#64748b', marginBottom: 12 }}>
            {previousQualified
              ? '✓ You have a previous purchase over R50. You can pay the driver.'
              : 'Enter your Cash Pass Code to pay the driver on delivery.'}
          </p>
          {!previousQualified && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                value={cpcCode}
                onChange={(e) => setCpcCode(e.target.value)}
                placeholder="CPC Code (e.g. geo683#YA2)"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: dark ? '1px solid rgba(71,85,105,0.5)' : '1px solid #e5e7eb',
                  background: dark ? '#0f172a' : '#fff',
                  color: dark ? '#fff' : '#1a1a1a',
                  fontSize: 14,
                }}
              />
              <button
                onClick={validateCPC}
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Verify
              </button>
            </div>
          )}
          <button
            onClick={handlePayDriver}
            disabled={!previousQualified && !cpcValid}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border: 'none',
              background: previousQualified || cpcValid ? '#f59e0b' : '#374151',
              color: '#fff',
              fontWeight: 700,
              cursor: previousQualified || cpcValid ? 'pointer' : 'not-allowed',
            }}
          >
            I'll Pay the Driver →
          </button>
        </div>

        <Link
          href={`/tracker?order=${orderId}`}
          style={{
            display: 'block',
            textAlign: 'center',
            color: '#10b981',
            textDecoration: 'none',
            padding: 14,
            borderRadius: 14,
            border: '1px solid #10b981',
            fontWeight: 700,
          }}
        >
          ← Back to Tracker
        </Link>
      </div>
    </div>
  );
}

function pageStyle(dark) {
  return {
    minHeight: '100vh',
    background: dark ? '#0f172a' : '#f6f7fb',
    color: dark ? '#fff' : '#1a1a1a',
    fontFamily: 'system-ui, sans-serif',
    padding: '16px',
  };
}