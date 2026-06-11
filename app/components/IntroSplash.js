'use client';

import Image from 'next/image';

export default function IntroSplash({ dark, onClose, onChat }) {
  const sparkles = [
    { left: '8%', top: '6%', size: 8, color: '#FFD166', dur: '2s' },
    { left: '22%', top: '10%', size: 6, color: '#FF6B6B', dur: '2.6s' },
    { left: '38%', top: '4%', size: 10, color: '#6EE7B7', dur: '3s' },
    { left: '62%', top: '8%', size: 7, color: '#60A5FA', dur: '2.8s' },
    { left: '78%', top: '6%', size: 6, color: '#F472B6', dur: '2.4s' },
    { left: '10%', top: '84%', size: 8, color: '#F59E0B', dur: '2.2s' },
    { left: '50%', top: '94%', size: 12, color: '#A78BFA', dur: '3.2s' },
    { left: '86%', top: '88%', size: 7, color: '#34D399', dur: '2.6s' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'linear-gradient(135deg, rgba(12,18,36,0.9), rgba(5,150,105,0.12))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, textAlign: 'center'
    }}>
      <div style={{
        width: 'min(420px, 94%)', borderRadius: 20, padding: 28,
        background: dark
          ? 'linear-gradient(180deg, rgba(10,14,25,0.92), rgba(17,24,39,0.85))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,250,250,0.9))',
        boxShadow: dark
          ? '0 20px 60px rgba(2,6,23,0.8), 0 6px 18px rgba(16,185,129,0.04)'
          : '0 20px 50px rgba(2,6,23,0.6), 0 6px 18px rgba(16,185,129,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'visible'
      }}>
        {/* Sparkles */}
        <div style={{ position: 'absolute', left: -6, top: -6, width: 'calc(100% + 12px)', height: 'calc(100% + 12px)', pointerEvents: 'none', overflow: 'visible' }}>
          {sparkles.map((s, i) => (
            <span key={i} style={{
              position: 'absolute', left: s.left, top: s.top,
              width: s.size, height: s.size, borderRadius: 6,
              background: s.color, opacity: 0.9, transformOrigin: 'center',
              filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.12))',
              animation: `floatUp ${s.dur} ease-in-out ${i * 120}ms infinite`
            }} />
          ))}
        </div>

        <div style={{
          width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
          border: '6px solid rgba(255,255,255,0.9)',
          boxShadow: '0 10px 30px rgba(16,185,129,0.18)',
          transform: 'translateY(-18px)', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Image src="/pictures/profile.jpeg" alt="YAF" width={112} height={112} style={{ objectFit: 'cover', borderRadius: '50%' }} />
        </div>

        <h1 style={{
          margin: '0 0 6px', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em',
          color: dark ? '#fff' : '#0f172a', lineHeight: 1.05, textTransform: 'uppercase',
          display: 'inline-block', padding: '6px 12px', borderRadius: 12,
          background: dark
            ? 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
            : 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35))',
          backdropFilter: 'blur(6px)'
        }}>
          Young Agripreneurs Store
        </h1>

        <p style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.7)', margin: 0, fontWeight: 700 }}>
          Drops. DMs. Dinner
        </p>

        <p style={{
          fontSize: 13, color: dark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.65)',
          margin: '6px 0 14px', maxWidth: 360
        }}>
          Slide in for campus-exclusive snack drops, curated by student leaders. Snag limited runs, collab packs, and order first in chat. Tap to peep today's drop, back a young farmer, and get it to your res fast.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 36px', borderRadius: 999, border: 'none',
              background: 'linear-gradient(90deg, #10b981, #0d9488)', color: '#fff',
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(16, 185, 129, 0.22)',
              transform: 'translateZ(0)', transition: 'transform 160ms ease, box-shadow 160ms ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
          >
            Let's Go
          </button>

          <button
            onClick={onChat}
            style={{
              marginTop: 8, padding: '10px 20px', borderRadius: 14,
              border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.06)',
              background: 'transparent', color: dark ? '#fff' : '#0f172a',
              fontWeight: 700, cursor: 'pointer'
            }}
          >
            Join the Chat
          </button>
        </div>
      </div>
    </div>
  );
}
