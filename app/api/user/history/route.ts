import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const userIdNum = Number(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const history = await sql`
      SELECT * FROM draw_history 
      WHERE user_id = ${userIdNum}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Failed to fetch user history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
