'use client'

import { useEffect, useRef, useState } from 'react'

type ClaimResult = {
  success?: boolean
  points?: number
  error?: string
}

export default function ScanPage() {
  const [playerName, setPlayerName] = useState('')
  const [savedName, setSavedName] = useState('')
  const [message, setMessage] = useState('Ready to scan')
  const [lastPoints, setLastPoints] = useState<number | null>(null)
  const [scannerStarted, setScannerStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showNameModal, setShowNameModal] = useState(false)
  const [tempName, setTempName] = useState('')

  const scannerRef = useRef<any>(null)
  const pauseRef = useRef(false)

  useEffect(() => {
    const storedName = localStorage.getItem('playerName') || ''
    setSavedName(storedName)
    setPlayerName(storedName)
    setTempName(storedName)

    if (!storedName) {
      setShowNameModal(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  async function startScanner() {
    const activeName = localStorage.getItem('playerName') || playerName.trim()

    if (!activeName) {
      setShowNameModal(true)
      setMessage('Please enter your name first')
      return
    }

    if (scannerStarted) return

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      const html5QrCode = new Html5Qrcode('reader')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        async (decodedText: string) => {
          if (pauseRef.current || isSubmitting) return

          pauseRef.current = true
          setIsSubmitting(true)

          try {
            const token = extractToken(decodedText)

            if (!token) {
              setMessage('Invalid QR code format')
              setLastPoints(null)
              return
            }

            const currentPlayer =
              localStorage.getItem('playerName') || playerName.trim()

            const res = await fetch('/api/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                playerId: currentPlayer,
              }),
            })

            const data: ClaimResult = await res.json()

            if (!res.ok) {
              setMessage(data.error || 'Error')
              setLastPoints(null)
            } else {
              setMessage('Success!')
              setLastPoints(data.points ?? null)
            }
          } catch {
            setMessage('Scan failed')
            setLastPoints(null)
          } finally {
            setIsSubmitting(false)

            setTimeout(() => {
              pauseRef.current = false
            }, 1500)
          }
        },
        () => {}
      )

      setScannerStarted(true)
      setMessage('Scanner started')
    } catch {
      setMessage('Unable to access camera')
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch {
    } finally {
      setScannerStarted(false)
    }
  }

  function extractToken(decodedText: string) {
    try {
      if (
        decodedText.startsWith('http://') ||
        decodedText.startsWith('https://')
      ) {
        const url = new URL(decodedText)
        return url.searchParams.get('t')
      }

      return decodedText.trim()
    } catch {
      return decodedText.trim()
    }
  }

  function openChangeNameModal() {
    setTempName(savedName)
    setShowNameModal(true)
  }

  function saveName() {
    const cleaned = tempName.trim()

    if (!cleaned) {
      setMessage('Please enter your name')
      return
    }

    localStorage.setItem('playerName', cleaned)
    setSavedName(cleaned)
    setPlayerName(cleaned)
    setShowNameModal(false)
    setMessage('Name saved')
  }

  function formatScore(points: number | null) {
    if (points === null) return '--'
    return `${points > 0 ? '+' : ''}${points}`
  }

  return (
    <main style={pageStyle}>
      <img src="/logo.png" style={logoStyle} />

      <div style={backgroundGlowTop} />
      <div style={backgroundGlowBottom} />

      <section style={heroCardStyle}>
        <div style={badgeStyle}>LIVE SCANNER</div>
        <h1 style={titleStyle}>Easter Egg Hunt</h1>
        <p style={subtitleStyle}>Scan each QR code to collect points instantly.</p>
      </section>

      <section style={statusGridStyle}>
        <div style={statusCardStyle}>
          <div style={statusLabelStyle}>Status</div>
          <div style={statusValueStyle}>{message}</div>
        </div>

        <div style={scoreCardStyle}>
          <div style={statusLabelStyle}>Last Score</div>
          <div style={scoreValueStyle}>{formatScore(lastPoints)}</div>
        </div>
      </section>

      <section style={actionRowStyle}>
        <button onClick={startScanner} style={primaryButtonStyle}>
          {scannerStarted ? 'Scanner Running' : 'Start Scanner'}
        </button>

        <button onClick={stopScanner} style={secondaryButtonStyle}>
          Stop Scanner
        </button>
      </section>

      <section style={scannerCardStyle}>
        <div style={scannerHeaderStyle}>
          <div style={scannerTitleStyle}>Scanner</div>
          <div style={scannerHintStyle}>Point your camera at the QR code</div>
        </div>

        <div id="reader" style={readerStyle} />
      </section>

      <section style={playerCardStyle}>
        <div>
          <div style={playerLabelStyle}>Current Player</div>
          <div style={playerNameStyle}>{savedName || 'Not set'}</div>
        </div>

        <button onClick={openChangeNameModal} style={secondaryButtonStyle}>
          Change Name
        </button>
      </section>

      {showNameModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalTitleStyle}>Enter Your Name</div>
            <div style={modalTextStyle}>
              This name will be used for your scans and leaderboard record.
            </div>

            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name"
              style={inputStyle}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveName()
                }
              }}
            />

            <div style={modalButtonRowStyle}>
              {savedName ? (
                <button
                  onClick={() => {
                    setShowNameModal(false)
                    setTempName(savedName)
                  }}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              ) : null}

              <button onClick={saveName} style={primaryButtonStyle}>
                Save Name
              </button>
            </div>
          </div>
        </div>
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
  background: 'rgba(255,255,255,0.85)',
  padding: '6px 12px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  padding: '32px 20px 48px',
  fontFamily: 'Arial, sans-serif',
  background: 'linear-gradient(180deg, #fff8e8 0%, #ffe7b3 100%)',
}

const backgroundGlowTop: React.CSSProperties = {
  position: 'absolute',
  top: '-120px',
  left: '-80px',
  width: '280px',
  height: '280px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.45)',
  filter: 'blur(10px)',
}

const backgroundGlowBottom: React.CSSProperties = {
  position: 'absolute',
  right: '-100px',
  bottom: '-120px',
  width: '320px',
  height: '320px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.35)',
  filter: 'blur(10px)',
}

const heroCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '760px',
  margin: '0 auto 20px',
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '28px',
  padding: '24px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '999px',
  background: '#111827',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  marginBottom: '12px',
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '34px',
  fontWeight: 800,
  color: '#111827',
}

const subtitleStyle: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: '16px',
  color: '#6b7280',
}

const playerCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '760px',
  margin: '20px auto 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '20px',
  padding: '16px 18px',
}

const playerLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#9a3412',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '6px',
}

const playerNameStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#111827',
}

const actionRowStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '760px',
  margin: '0 auto 20px',
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
}

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '14px',
  padding: '14px 18px',
  background: '#f59e0b',
  color: '#111827',
  fontWeight: 800,
  fontSize: '15px',
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(245,158,11,0.28)',
}

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: '14px',
  padding: '14px 18px',
  background: '#ffffff',
  color: '#111827',
  fontWeight: 700,
  fontSize: '15px',
  cursor: 'pointer',
}

const scannerCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '760px',
  margin: '0 auto 20px',
  background: 'rgba(255,255,255,0.94)',
  borderRadius: '28px',
  padding: '20px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
}

const scannerHeaderStyle: React.CSSProperties = {
  marginBottom: '16px',
}

const scannerTitleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#111827',
}

const scannerHintStyle: React.CSSProperties = {
  marginTop: '6px',
  fontSize: '14px',
  color: '#6b7280',
}

const readerStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '320px',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '2px dashed #f59e0b',
  background: '#fffaf0',
}

const statusGridStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '760px',
  margin: '0 auto 20px',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '14px',
}

const statusCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.94)',
  borderRadius: '24px',
  padding: '20px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
}

const scoreCardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #fff7ed 0%, #fed7aa 100%)',
  borderRadius: '24px',
  padding: '20px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
}

const statusLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#9a3412',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
}

const statusValueStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#111827',
  lineHeight: 1.3,
}

const scoreValueStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 900,
  color: '#7c2d12',
  lineHeight: 1.1,
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(17,24,39,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 50,
}

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: '#ffffff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 20px 50px rgba(0,0,0,0.20)',
}

const modalTitleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#111827',
  marginBottom: '10px',
}

const modalTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: 1.5,
  marginBottom: '16px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid #d1d5db',
  fontSize: '16px',
  marginBottom: '16px',
  outline: 'none',
  boxSizing: 'border-box',
}

const modalButtonRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
}