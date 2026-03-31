'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClaimPage() {
  const params = useSearchParams()
  const token = params.get('t')

  const [message, setMessage] = useState('Processing...')
  const [points, setPoints] = useState<number | null>(null)

  useEffect(() => {
    async function run() {
      if (!token) {
        setMessage('Missing QR code')
        return
      }

      const playerName = localStorage.getItem('playerName')

      if (!playerName) {
        setMessage('Please open the scanner page first.')
        return
      }

      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, playerId: playerName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Error')
        return
      }

      setPoints(data.points)
      setMessage('Success!')
    }

    run()
  }, [token])

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Easter Egg Hunt</h1>
      <h2>{message}</h2>
      {points !== null && <h3>You got {points} points</h3>}
    </main>
  )
}