'use client';

export default function MegaShoppingBanner({ dark, cpcData, megaShopping }) {
  if (!megaShopping || !cpcData) {
    return (
      <div style={{
        marginBottom: 16, padding: 12, borderRadius: 16,
        background: dark ? 'rgba(51,65,85,0.4)' : '#f1f5f9',
        border: dark ? '1px solid rgba(71,85,105,0.3)' : '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}>💻</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: dark ? '#fff' : '#0f172a' }}>Normal Shopping</div>
          <div style={{ fontSize: 12, color: dark ? '#94a3b8' : '#64748b' }}>
            Enter Cash Pass Code to unlock Mega Shopping & perks
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: 16, padding: 14, borderRadius: 16,
      background: 'linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6)',
      color: '#fff', boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
      }}>💎</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>MEGA Shopping Activated</div>
        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
          CPC: {cpcData.code} • Category {cpcData.category} • Points: {cpcData.points?.points_balance || 0}
        </div>
      </div>
    </div>
  );
}