import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ClaimRow = {
  player_name: string
  points: number
}

export async function GET() {
  try {
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
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}