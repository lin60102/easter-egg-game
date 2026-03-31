import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { token, playerId } = await req.json()

    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 })
    }

    if (!playerId) {
      return Response.json({ error: 'Missing player name' }, { status: 400 })
    }

    const { data: egg, error: findError } = await supabase
      .from('eggs')
      .select('*')
      .eq('token', token)
      .single()

    if (findError || !egg) {
      return Response.json({ error: 'Invalid QR code' }, { status: 404 })
    }

    if (egg.claimed) {
      return Response.json({ error: 'Already claimed' }, { status: 409 })
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from('eggs')
      .update({
        claimed: true,
        claimed_by: playerId,
        claimed_at: new Date().toISOString(),
      })
      .eq('token', token)
      .eq('claimed', false)
      .select()

    if (updateError) {
      return Response.json(
        { error: `Failed to claim egg: ${updateError.message}` },
        { status: 500 }
      )
    }

    if (!updatedRows || updatedRows.length === 0) {
      return Response.json({ error: 'Already claimed' }, { status: 409 })
    }

    const { error: claimInsertError } = await supabase
      .from('claims')
      .insert({
        token,
        player_name: playerId,
        points: egg.points,
      })

    if (claimInsertError) {
      return Response.json(
        { error: `Failed to save claim history: ${claimInsertError.message}` },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      points: egg.points,
    })
  } catch {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}