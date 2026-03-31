'use client'

import { useEffect, useState } from 'react'

type LeaderboardRow = {
  player_name: string
  total_points: number
}

export default function LeaderboardTvPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [message, setMessage] = useState('Loading leaderboard...')

  async function loadLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard', {
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Failed to load leaderboard')
        return
      }

      setRows((data.leaderboard || []).slice(0, 10))
      setMessage('')
    } catch {
      setMessage('Failed to load leaderboard')
    }
  }

  useEffect(() => {
    loadLeaderboard()
    const timer = setInterval(loadLeaderboard, 5000)
    return () => clearInterval(timer)
  }, [])

  const first = rows[0]
  const second = rows[1]
  const third = rows[2]
  const others = rows.slice(3, 10)

  return (
    <main style={pageStyle}>
      <img src="/logo.png" style={logoStyle} />

      <div style={bgGlow1} />
      <div style={bgGlow2} />

      <header style={headerStyle}>
        <div style={titleBadge}>LIVE EVENT</div>
        <h1 style={titleStyle}>Easter Egg Hunt Leaderboard</h1>
        <p style={subtitleStyle}>Top Players</p>
      </header>

      {message ? (
        <div style={messageStyle}>{message}</div>
      ) : rows.length === 0 ? (
        <div style={messageStyle}>No scores yet.</div>
      ) : (
        <>
          {first && (
            <section style={championWrap}>
              <div style={championSpotlight} />
              <div style={championCard}>
                <div style={championCrown}>👑</div>
                <div style={championRank}>#1</div>
                <div style={championName}>{first.player_name}</div>
                <div style={championPoints}>{first.total_points} pts</div>
              </div>
            </section>
          )}

          <section style={podiumRow}>
            {second ? (
              <div style={{ ...podiumCard, ...secondCard }}>
                <div style={podiumMedal}>🥈</div>
                <div style={podiumRank}>#2</div>
                <div style={podiumName}>{second.player_name}</div>
                <div style={podiumPoints}>{second.total_points} pts</div>
              </div>
            ) : (
              <div />
            )}

            {third ? (
              <div style={{ ...podiumCard, ...thirdCard }}>
                <div style={podiumMedal}>🥉</div>
                <div style={podiumRank}>#3</div>
                <div style={podiumName}>{third.player_name}</div>
                <div style={podiumPoints}>{third.total_points} pts</div>
              </div>
            ) : (
              <div />
            )}
          </section>

          <section style={tableSection}>
            <div style={tableTitleRow}>
              <div style={tableTitle}>Rankings 4 - 10</div>
              <div style={refreshNote}>Auto refresh every 5 seconds</div>
            </div>

            <div style={tableHeader}>
              <div>Rank</div>
              <div>Name</div>
              <div style={{ textAlign: 'right' }}>Points</div>
            </div>

            {others.map((row, index) => (
              <div key={row.player_name} style={tableRow}>
                <div style={tableRank}>#{index + 4}</div>
                <div style={tableName}>{row.player_name}</div>
                <div style={tablePoints}>{row.total_points}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  )
}

const logoStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  height: '70px',
  zIndex: 10,
  background: 'rgba(255,255,255,0.9)',
  padding: '6px 12px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  padding: '28px 36px 40px',
  fontFamily: 'Arial, sans-serif',
  color: '#1f2937',
  background: 'linear-gradient(135deg, #fffdf7 0%, #e9c8d0 40%, #ffffff 100%)',
}

const bgGlow1: React.CSSProperties = {
  position: 'absolute',
  width: 420,
  height: 420,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.7)',
  top: -120,
  left: -80,
  filter: 'blur(14px)',
}

const bgGlow2: React.CSSProperties = {
  position: 'absolute',
  width: 520,
  height: 520,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.5)',
  bottom: -180,
  right: -120,
  filter: 'blur(14px)',
}

const headerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  marginBottom: '18px',
}

const titleBadge: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 18px',
  borderRadius: '999px',
  background: 'rgba(17,24,39,0.85)',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 800,
  letterSpacing: '1px',
  marginBottom: '14px',
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '60px',
  lineHeight: 1.05,
  fontWeight: 900,
  color: '#111827',
  textShadow: '0 2px 0 rgba(255,255,255,0.35)',
}

const subtitleStyle: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: '24px',
  fontWeight: 700,
  color: '#be185d',
}

const messageStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1100px',
  margin: '80px auto 0',
  padding: '40px',
  borderRadius: '28px',
  background: 'rgba(255,255,255,0.94)',
  textAlign: 'center',
  fontSize: '34px',
  fontWeight: 800,
  boxShadow: '0 14px 40px rgba(0,0,0,0.12)',
}

const championWrap: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  marginTop: '10px',
  marginBottom: '18px',
}

const championSpotlight: React.CSSProperties = {
  position: 'absolute',
  top: -16,
  width: 420,
  height: 300,
  background:
    'radial-gradient(circle, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 72%)',
  pointerEvents: 'none',
}

const championCard: React.CSSProperties = {
  minWidth: '460px',
  padding: '30px 48px 34px',
  borderRadius: '36px',
  textAlign: 'center',
  background: 'linear-gradient(180deg, #fffdf7 0%, #e9c8d0 58%, #c5a8b3 100%)',
  border: '2px solid #eae5c0',
  boxShadow: '0 12px 30px rgba(197,168,179,0.28)',
}

const championCrown: React.CSSProperties = {
  fontSize: '46px',
  marginBottom: '4px',
}

const championRank: React.CSSProperties = {
  fontSize: '68px',
  fontWeight: 900,
  lineHeight: 1,
  marginBottom: '14px',
  color: '#111827',
}

const championName: React.CSSProperties = {
  fontSize: '46px',
  fontWeight: 900,
  lineHeight: 1.1,
  marginBottom: '14px',
  color: '#111827',
  textShadow: '0 2px 4px rgba(0,0,0,0.12)',
}

const championPoints: React.CSSProperties = {
  fontSize: '54px',
  fontWeight: 900,
  color: '#fde047',
  textShadow: '0 4px 12px rgba(0,0,0,0.18)',
}

const podiumRow: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto 24px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '28px',
}

const podiumCard: React.CSSProperties = {
  padding: '24px 28px',
  borderRadius: '28px',
  textAlign: 'center',
  boxShadow: '0 14px 32px rgba(0,0,0,0.10)',
  border: '2px solid rgba(255,255,255,0.75)',
}

const secondCard: React.CSSProperties = {
  background: 'linear-gradient(180deg, #ffffff 0%, #b9dae3 100%)',
}

const thirdCard: React.CSSProperties = {
  background: 'linear-gradient(180deg, #fffdf7 0%, #eae5c0 100%)',
}

const podiumMedal: React.CSSProperties = {
  fontSize: '34px',
  marginBottom: '6px',
}

const podiumRank: React.CSSProperties = {
  fontSize: '44px',
  fontWeight: 900,
  marginBottom: '12px',
  color: '#111827',
}

const podiumName: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  marginBottom: '10px',
  wordBreak: 'break-word',
  color: '#111827',
}

const podiumPoints: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 900,
  color: '#9a3412',
}

const tableSection: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  borderRadius: '30px',
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
}

const tableTitleRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 28px 16px',
  background: 'linear-gradient(90deg, #5c3d2e 0%, #7a5230 100%)',
  color: '#fff',
}

const tableTitle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 900,
}

const refreshNote: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  opacity: 0.9,
}

const tableHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '160px 1fr 180px',
  padding: '18px 28px',
  background: '#3e2723',
  color: '#fff',
  fontSize: '24px',
  fontWeight: 900,
}

const tableRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '160px 1fr 180px',
  padding: '18px 28px',
  alignItems: 'center',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '28px',
  fontWeight: 800,
}

const tableRank: React.CSSProperties = {
  color: '#6f4e37',
}

const tableName: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingRight: '18px',
}

const tablePoints: React.CSSProperties = {
  textAlign: 'right',
  color: '#111827',
}