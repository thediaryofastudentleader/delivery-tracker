'use client';

export default function CashPassCodeCard({ cpcData }) {
  if (!cpcData) return null;
  const categoryLabels = { 1: 'Silver', 2: 'Gold', 3: 'Platinum', 4: 'Blue' };

  return (
    <div style={{
      marginBottom: 20, padding: 20, borderRadius: 20,
      background: 'linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)',
      color: '#fff', boxShadow: '0 12px 32px rgba(37,99,235,0.3)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', bottom: -10, left: -10,
        width: 60, height: 60, background: 'rgba(255,255,255,0.08)', borderRadius: '50%'
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7, marginBottom: 4 }}>
              Young Agripreneurs
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>CASH PASS</div>
          </div>
          <div style={{ fontSize: 28 }}>💎</div>
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
          letterSpacing: 2, marginBottom: 12, textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {cpcData.code}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase' }}>Holder</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{cpcData.customer_name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase' }}>Category</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {categoryLabels[cpcData.category] || 'Blue'} ({cpcData.category})
            </div>
          </div>
        </div>
        {cpcData.points && (
          <div style={{
            marginTop: 12, paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Points Balance</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{cpcData.points.points_balance} pts</div>
          </div>
        )}
      </div>
    </div>
  );
}