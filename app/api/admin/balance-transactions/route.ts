import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const transactions = await sql`
      SELECT *
      FROM balance_transactions
      ORDER BY created_at DESC
      LIMIT 500
    `

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
