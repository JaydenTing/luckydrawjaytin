import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const history = await sql`
      SELECT 
        dh.id,
        dh.user_id,
        u.username,
        dh.prize_name,
        dh.draw_type,
        dh.created_at
      FROM draw_history dh
      JOIN users u ON dh.user_id = u.id
      ORDER BY dh.created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Failed to fetch draw history:", error)
    return NextResponse.json({ error: "Failed to fetch draw history" }, { status: 500 })
  }
}
