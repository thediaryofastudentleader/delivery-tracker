'use client';

import { useState, useEffect } from 'react';

const PRIZES = [
  { label: 'R5 OFF', color: '#10b981', type: 'discount', value: 5 },
  { label: '50 PTS', color: '#3b82f6', type: 'points', value: 50 },
  { label: 'No Prize', color: '#64748b', type: 'none', value: 0 },
  { label: 'R10 OFF', color: '#f59e0b', type: 'discount', value: 10 },
  { label: '100 PTS', color: '#8b5cf6', type: 'points', value: 100 },
  { label: 'Free Delivery', color: '#ec4899', type: 'delivery', value: 0 },
  { label: '200 PTS', color: '#06b6d4', type: 'points', value: 200 },
  { label: 'Spin Again', color: '#ef4444', type: 'again', value: 0 },
];

export default function SpinWheel({ cpcCode, orderTotal, dark, onPrize, cpcCategory }) {
  const [canSpin, setCanSpin] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [alreadySpun, setAlreadySpun] = useState(false);

  // Only Cat 2 & 1 can spin
  const eligible = cpcCategory >= 2;

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const isTueOrFri = day === 2 || day === 5;
      const isAfternoonEvening = hour >= 12 && hour < 22;
      if (!isTueOrFri || !isAfternoonEvening || !cpcCode || !eligible) {
        setCanSpin(false);
        return;
      }
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const lastSpin = localStorage.getItem(`spin_${cpcCode}_${weekStart.toISOString().split('T')[0]}`);
      setAlreadySpun(!!lastSpin);
      setCanSpin(!lastSpin);
    };
    check();
  }, [cpcCode, eligible]);

  const spin = () => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    setResult(null);
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const spins = 5 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / PRIZES.length;
    const finalRotation = spins * 360 + (prizeIndex * segmentAngle) + (segmentAngle / 2);
    setRotation(finalRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(PRIZES[prizeIndex]);
      setCanSpin(false);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      localStorage.setItem(`spin_${cpcCode}_${weekStart.toISOString().split('T')[0]}`, 'true');
      if (onPrize) onPrize(PRIZES[prizeIndex]);
    }, 4000);
  };

  if (!cpcCode || !eligible) return null;

  const now = new Date();
  const isTueOrFri = now.getDay() === 2 || now.getDay() === 5;
  const isAfternoonEvening = now.getHours() >= 12 && now.getHours() < 22;

  if (!isTueOrFri || !isAfternoonEvening) {
    return (
      <div style={{
        marginBottom: 16, padding: 12, borderRadius: 12,
        background: dark ? 'rgba(51,65,85,0.4)' : '#f1f5f9',
        textAlign: 'center', color: dark ? '#94a3b8' : '#64748b', fontSize: 13
      }}>
        🎰 Spin & Win available Tue/Fri 12PM-10PM (Cat 2 & 1 only)
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => setShowWheel(true)} disabled={!canSpin} style={{
        width: '100%', padding: 14, borderRadius: 16, border: 'none',
        background: canSpin ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#374151',
        color: '#fff', fontWeight: 700, cursor: canSpin ? 'pointer' : 'not-allowed', fontSize: 15
      }}>
        {alreadySpun ? '🎰 Already Spun This Week' : '🎰 Spin & Win — 1 Attempt'}
      </button>

      {showWheel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: dark ? '#1f2937' : '#fff', borderRadius: 24, padding: 24, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px', color: dark ? '#fff' : '#1a1a1a' }}>🎰 Spin & Win</h3>
            <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 20px' }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                width: 260, height: 260, borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${PRIZES.map((p, i) => \`${p.color} \${i * 45}deg \${(i + 1) * 45}deg\`).join(', ')})`,
                transition: 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
              }} />
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid #ef4444', zIndex: 10 }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 50, height: 50, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 5 }}>SPIN</div>
            </div>
            <button onClick={spin} disabled={spinning || !canSpin} style={{ padding: '12px 32px', borderRadius: 16, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
              {spinning ? 'Spinning...' : 'SPIN'}
            </button>
            {result && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: result.color + '20', color: result.color, fontWeight: 700 }}>
                You won: {result.label}!
              </div>
            )}
            <button onClick={() => setShowWheel(false)} style={{ marginTop: 12, background: 'none', border: 'none', color: dark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
