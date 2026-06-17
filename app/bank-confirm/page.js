import { Suspense } from 'react';
import BankConfirmationClient from './BankConfirmationClient';

export default function BankConfirmPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f6f7fb',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 2s infinite' }}>
              🏦
            </div>
            <div style={{ color: '#64748b', fontSize: 16 }}>Loading payment page...</div>
          </div>
        </div>
      }
    >
      <BankConfirmationClient />
    </Suspense>
  );
}