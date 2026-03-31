import { createClient } from '@supabase/supabase-js'

type ClaimRow = {
  player_name: string
  points: number
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('claims')
      .select('player_name, points')
      .order('claimed_at', { ascending: false })

    if (error) {
      return Response.json(
        { error: `Failed to load leaderboard: ${error.message}` },
        { status: 500 }
      )
    }

    const totals: Record<string, number> = {}

    for (const row of (data || []) as ClaimRow[]) {
      totals[row.player_name] = (totals[row.player_name] || 0) + row.points
    }

    const leaderboard = Object.entries(totals)
      .map(([player_name, total_points]) => ({
        player_name,
        total_points,
      }))
      .sort((a, b) => b.total_points - a.total_points)

    return Response.json({ leaderboard })
  } catch {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}